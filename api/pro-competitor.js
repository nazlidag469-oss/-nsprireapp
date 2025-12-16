import { createClient } from "@supabase/supabase-js";

function pickEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function normalizeEmail(raw) {
  const e = String(raw || "").trim().toLowerCase();
  if (!e || e === "null" || e === "undefined") return "";
  return e;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function fallbackCompetitor(input) {
  const s = String(input || "").trim();
  const seed = s.length;
  const hooks = [
    `Herkes ${s || "bu konuda"} yanlış biliyor.`,
    `Bunu 10 saniyede düzeltiyorum.`,
    `1 hata yüzünden kimse sonuç alamıyor.`,
    `Şu 3 hamleyle fark açarsın.`,
    `Gerçek sebep bu:`,
    `Kaydet, sonra lazım olacak.`,
  ];
  const pick = (i) => hooks[(seed + i) % hooks.length];
  return [
    `10 saniyede teşhis:`,
    `- Vaat: ${s ? `"${s}" üzerinden net bir sonuç/merak` : "Net bir sonuç/merak"}`,
    `- Duygu: merak + hızlı çözüm`,
    `- Hedef: kısa sürede pratik isteyen kitle`,
    ``,
    `Akış (0–30 sn):`,
    `- 0–2: ${pick(0)}`,
    `- 2–6: “Şu yüzden olmuyor…” (tek cümle teşhis)`,
    `- 6–12: 2 madde çözüm (her biri 2–3 sn)`,
    `- 12–20: mini örnek/önce-sonra`,
    `- 20–30: “Kaydet + Devamı gelsin mi?” CTA`,
    ``,
    `6 hook:`,
    `- ${pick(1)}`,
    `- ${pick(2)}`,
    `- ${pick(3)}`,
    `- ${pick(4)}`,
    `- “Bunu yapmadan sakın başlama.”`,
    `- “1 dakikada farkı görürsün.”`,
    ``,
    `Not: OpenAI geç yanıt verdi; geçici hızlı reçete verdim. Tekrar dener misin?`,
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const SUPABASE_URL = pickEnv("SUPABASE_URL", "SUPABASEURL");
  const SUPABASE_SERVICE_KEY = pickEnv(
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASESERVICEROLEKEY"
  );

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(200).json({
      code: "SUPABASE_ENV_MISSING",
      message: "Supabase env eksik: SUPABASE_URL + SUPABASE_SERVICE_KEY",
    });
  }

  const OPENAI_API_KEY = pickEnv("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return res.status(200).json({
      code: "OPENAI_ENV_MISSING",
      message: "OPENAI_API_KEY tanımlı değil.",
    });
  }

  const model = pickEnv("OPENAI_MODEL") || "gpt-4o-mini";

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const email = normalizeEmail(body?.email || req.headers["x-user-email"]);
  const input = String(body?.input || "").trim();
  const lang = String(body?.lang || "Turkish").trim();

  if (!email) return res.status(200).json({ code: "NEED_LOGIN", message: "E-posta ile giriş gerekli." });
  if (!input) return res.status(200).json({ code: "EMPTY_INPUT", message: "Bir açıklama/link/konsept yaz." });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

  const { data: user, error } = await supabase
    .from("users")
    .select("email, plan, is_pro")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return res.status(200).json({ code: "SUPABASE_QUERY_ERROR", message: error.message || "Supabase hata" });
  }
  if (!user) {
    return res.status(200).json({ code: "USER_NOT_FOUND", message: "Kullanıcı yok. Giriş yap." });
  }

  const isPro = user.plan === "pro" || user.is_pro === true;
  if (!isPro) {
    return res.status(200).json({ code: "PRO_REQUIRED", message: "PRO değilsin. PRO ile açılır." });
  }

  const system = `
You are InspireApp PRO competitor-video coach.
Language: ${lang}
Give concrete, non-generic advice based on the input.
No markdown (#, **, ```). Plain text.
Be fast: keep output compact but useful.
`.trim();

  const userPrompt = `
INPUT: ${input}

Deliver:
A) 10s diagnosis (promise, audience, emotion).
B) 0-30s script plan (0-2 / 2-6 / 6-12 / 12-20 / 20-30) each 1-2 lines.
C) 6 hook lines (mixed: aggressive/curiosity/contrarian).
D) Captions: 8 short (5-7 words) + 10 single-word punches.
E) Editing recipe: pace, text, b-roll, cuts.
F) 3 A/B intro variants.
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
          max_tokens: 420, // ✅ HIZ için düşürdüm (15sn'i aşmasın)
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
        }),
      },
      12000 // ✅ JS 15sn timeout'u aşmadan dön
    );

    const d = await r.json().catch(() => null);
    if (!r.ok) {
      return res.status(200).json({ code: "OPENAI_ERROR", message: fallbackCompetitor(input) });
    }

    const text = d?.choices?.[0]?.message?.content || "";
    if (!text.trim()) {
      return res.status(200).json({ code: "EMPTY_AI", message: fallbackCompetitor(input) });
    }

    return res.status(200).json({ message: text.trim() });
  } catch {
    // ✅ Timeout/Abort olsa bile BOŞ DÖNME
    return res.status(200).json({ code: "OPENAI_TIMEOUT", message: fallbackCompetitor(input) });
  }
}
