// pages/api/pro-competitor.js
import { createClient } from "@supabase/supabase-js";

function getEnvAny(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function json(res, status, payload) {
  return res.status(status).json(payload);
}

async function readJson(req) {
  try {
    if (typeof req.body === "object") return req.body;
    return JSON.parse(req.body || "{}");
  } catch {
    return {};
  }
}

async function fetchOpenAI({ apiKey, messages, maxTokens = 900, temperature = 0.7 }) {
  // Vercel’de bazen “aborted” yiyorsun: en sağlamı kendi timeout’ını yönetmek
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000); // 55s

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature,
        max_tokens: maxTokens,
        messages,
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const msg =
        data?.error?.message ||
        `OpenAI hata (HTTP ${r.status}).`;
      throw new Error(msg);
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return String(text).trim();
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { message: "Sadece POST destekleniyor." });
  }

  try {
    // ✅ ENV FIX (asıl sorun buydu)
    const supabaseUrl = getEnvAny("SUPABASE_URL", "SUPABASEURL");
    const supabaseServiceKey = getEnvAny("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICEROLE_KEY", "SUPABASESERVICEROLEKEY");
    const openaiKey = getEnvAny("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return json(res, 500, {
        message: "Supabase env eksik: SUPABASE_URL / SUPABASE_SERVICE_KEY",
        code: "ENV_MISSING",
      });
    }
    if (!openaiKey) {
      return json(res, 500, { message: "OPENAI_API_KEY eksik.", code: "ENV_MISSING" });
    }

    const body = await readJson(req);
    const emailFromHeader = String(req.headers["x-user-email"] || "").trim().toLowerCase();
    const email = String(body.email || emailFromHeader || "").trim().toLowerCase();
    const input = String(body.input || "").trim();
    const lang = String(body.lang || "Turkish");

    if (!email) return json(res, 401, { code: "NEED_LOGIN", message: "E-posta ile giriş gerekli." });
    if (!input) return json(res, 400, { message: "Boş istek.", code: "BAD_REQUEST" });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // kullanıcı kontrolü
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("email, plan, is_pro")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("SUPABASE_USER_READ_ERROR", userErr);
      return json(res, 500, { message: "Kullanıcı okunamadı.", code: "SUPABASE_ERROR" });
    }
    if (!user) return json(res, 401, { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı." });

    const isPro = user.plan === "pro" || user.is_pro === true;
    if (!isPro) {
      return json(res, 403, { code: "PRO_REQUIRED", message: "PRO değilsiniz. PRO’ya geçerek açabilirsiniz." });
    }

    // ✅ PRO prompt (daha dolu, ezber değil)
    const system = `You are InspireApp PRO: a ruthless but practical short-video strategist.
Return highly actionable, specific guidance. Avoid generic filler.
Language: ${lang}. If Turkish is requested, output in Turkish.`;

    const userPrompt = `
Aşağıdaki içerik, bir rakip kısa video (TikTok/Reels/Shorts) için analiz isteği.
Girdi bir URL de olabilir, sadece açıklama da olabilir:

GİRDİ:
${input}

İSTEK:
1) Videonun muhtemel HOOK’unu 0–2 sn için 3 alternatifle yaz (kısa, vurucu).
2) Akış: 0–2 / 2–6 / 6–12 / 12–20 / 20–30 sn şeklinde saniye saniye “ne gösterilmeli, ne yazılmalı”.
3) Ekran yazıları (caption): max 6 kelime/satır; 8–12 satır öner.
4) Montaj reçetesi: tempo, cut aralığı, B-roll, zoom, altyazı ritmi.
5) “Ben bunu daha iyi yaparım” için 5 net iyileştirme (ölçülebilir: daha hızlı giriş, daha net vaat, vb.)
6) CTA: 5 seçenek (yorum/kayıt/takip).

ÇIKTI:
Başlıklar ve maddelerle; somut, uygulanabilir, tekrar etmeyen bir analiz.
`;

    let answer = "";
    try {
      answer = await fetchOpenAI({
        apiKey: openaiKey,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 950,
        temperature: 0.75,
      });
    } catch (e) {
      console.error("OPENAI_PRO_COMPETITOR_ERROR", e);
      const msg = String(e?.message || "");
      // abort vs timeout ayrımı
      if (/aborted|AbortError/i.test(msg)) {
        return json(res, 504, { message: "AI yanıtı zaman aşımına uğradı. Tekrar dene.", code: "AI_TIMEOUT" });
      }
      return json(res, 502, { message: "AI servisi hatası: " + msg, code: "AI_ERROR" });
    }

    return json(res, 200, { message: answer });
  } catch (e) {
    console.error("PRO_COMPETITOR_FATAL", e);
    return json(res, 500, { message: "Beklenmeyen sunucu hatası.", code: "SERVER_ERROR" });
  }
        }
