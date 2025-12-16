// pages/api/pro-competitor.js
// PRO: Rakip Video Analizi (detaylı + yönlendirici)
// - Supabase users tablosundan PRO kontrolü yapar
// - OpenAI ile analiz üretir

import { createClient } from "@supabase/supabase-js";

function pickEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function normalizeEmail(raw) {
  const e = String(raw || "").trim().toLowerCase();
  if (!e || e === "null" || e === "undefined") return "";
  return e;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { message: "Sadece POST destekleniyor." });
  }

  // ✅ ENV: senin Vercel isimlerine uyumlu
  const SUPABASE_URL = pickEnv("SUPABASE_URL", "SUPABASEURL");
  const SUPABASE_SERVICE_KEY = pickEnv(
    "SUPABASE_SERVICE_KEY",          // ✅ sende bu var
    "SUPABASE_SERVICE_ROLE_KEY",     // bazı projelerde bu olur
    "SUPABASESERVICEROLEKEY"         // eski isim
  );

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return json(res, 200, {
      code: "SUPABASE_ENV_MISSING",
      message:
        "Supabase env eksik: SUPABASE_URL ve SUPABASE_SERVICE_KEY (Vercel Settings > Environment Variables)",
    });
  }

  const OPENAI_API_KEY = pickEnv("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return json(res, 200, {
      code: "OPENAI_ENV_MISSING",
      message: "OPENAI_API_KEY tanımlı değil (Vercel env).",
    });
  }

  const model = pickEnv("OPENAI_MODEL") || "gpt-4o-mini";

  // Body
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const email = normalizeEmail(body?.email || req.headers["x-user-email"]);
  const input = String(body?.input || "").trim();
  const lang = String(body?.lang || "Turkish").trim();

  if (!email) {
    return json(res, 200, { code: "NEED_LOGIN", message: "E-posta ile giriş gerekli." });
  }
  if (!input) {
    return json(res, 200, { code: "EMPTY_INPUT", message: "Lütfen bir video açıklaması/link/konsept yaz." });
  }

  // Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Kullanıcı kontrol + PRO kontrol
  const { data: user, error } = await supabase
    .from("users")
    .select("email, plan, is_pro")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return json(res, 200, {
      code: "SUPABASE_QUERY_ERROR",
      message: "Supabase sorgu hatası: " + (error.message || "unknown"),
    });
  }

  if (!user) {
    return json(res, 200, { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı. Giriş yap." });
  }

  const isPro = user.plan === "pro" || user.is_pro === true;
  if (!isPro) {
    return json(res, 200, { code: "PRO_REQUIRED", message: "PRO değilsin. PRO ile açılır." });
  }

  // ✅ PRO prompt: ezber gibi değil, girişe göre değişken / daha sohbet gibi
  const system = `
Sen InspireApp'in PRO "Rakip Video Analizi" uzmanısın.
Amaç: Kullanıcıya rakip videoyu nasıl daha iyi yapacağını NET ve uygulanabilir şekilde söylemek.
Klişe/ezber şablon verme. Her cevap girilen içeriğe göre değişsin.
Yanıt dili: ${lang}. Çok kısa geçme, ama gereksiz uzatma da yapma.
Çıktı formatı düz metin olsun (markdown yıldızları, başlık # falan kullanma).
`.trim();

  const userPrompt = `
Rakip video (kullanıcının yazdığı): ${input}

Şunları üret:
1) 10 saniyede teşhis: Bu video ne vaat ediyor, hedef kitle kim, tetikleyici duygu ne?
2) "Bunu BEN yapsam" planı: 0-2 sn / 2-6 sn / 6-12 sn / 12-20 sn / 20-30 sn akışı (her bölüm 1-2 cümle net)
3) 6 farklı hook cümlesi (agresif + merak + ters köşe karışık)
4) Caption paketi: 8 kısa caption (5-7 kelime), 10 tek kelimelik vurgu (örn: HATA, ÇÖZÜM, KAZANÇ)
5) Kurgu reçetesi: tempo, ekran yazısı, B-roll önerileri, ses/müzik, cut aralıkları (somut)
6) A/B test: 3 farklı giriş varyasyonu + nasıl test edeceğiz
7) En sonda: Kullanıcıdan 2 tane net bilgi iste (video süresi hedefi ve hedef kitle) ama cevabı onlara bağlı bırakma; yine de çözüm ver.
`.trim();

  try {
    const r = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 900,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
        }),
      },
      25000
    );

    const d = await r.json().catch(() => null);

    if (!r.ok) {
      const msg = d?.error?.message || "OpenAI isteğinde hata oluştu.";
      return json(res, 200, { code: "OPENAI_ERROR", message: msg });
    }

    const text = d?.choices?.[0]?.message?.content || "";
    if (!text.trim()) {
      return json(res, 200, { code: "EMPTY_AI", message: "Şu an içerik üretilemedi, tekrar dene." });
    }

    return json(res, 200, { message: text.trim() });
  } catch (e) {
    // Abort / timeout vb.
    const msg = String(e?.name || "").includes("Abort")
      ? "İstek zaman aşımına uğradı. Tekrar dene."
      : "Beklenmeyen hata: " + (e?.message || "unknown");

    return json(res, 200, { code: "OPENAI_PRO_COMPETITOR_ERROR", message: msg });
  }
}
