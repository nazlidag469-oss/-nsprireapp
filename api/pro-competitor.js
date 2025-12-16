// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi (sohbet gibi + tekrar etmeyen + daha net yönlendiren)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

const LANG_MAP = {
  tr: "Turkish",
  en: "English",
  es: "Spanish",
  de: "German",
  ar: "Arabic",
};

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email, x-email");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function normalizeEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s === "null" || s === "undefined" || s === "none") return "";
  return s;
}
function normalizePlan(v) {
  return String(v || "").trim().toLowerCase();
}
function isProUser(userRow) {
  if (!userRow) return false;
  const p1 = normalizePlan(userRow.plan);
  const p2 = normalizePlan(userRow.Plan);
  if (p1 === "pro" || p2 === "pro") return true;
  if (userRow.is_pro === true) return true;
  return false;
}
function getHeaderEmail(req) {
  return (
    req.headers["x-user-email"] ||
    req.headers["x-email"] ||
    req.headers["x_user_email"] ||
    req.headers["x_email"] ||
    ""
  );
}

function detectLangKey(langRaw) {
  if (!langRaw) return "tr";
  const val = String(langRaw).toLowerCase();
  if (LANG_MAP[val]) return val;
  for (const [code, name] of Object.entries(LANG_MAP)) {
    if (String(name).toLowerCase() === val) return code;
  }
  return "tr";
}

async function fetchOpenAIChat({
  messages,
  maxTokens = 900,
  timeoutMs = 16000,
}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.85,          // daha yaratıcı ama hâlâ kontrollü
        presence_penalty: 0.45,     // tekrar eden şablonu kırar
        frequency_penalty: 0.25,    // aynı cümleleri azaltır
        max_tokens: maxTokens,
      }),
    });

    const data = await r.json().catch(() => null);
    if (!r.ok) {
      console.error("OPENAI_PRO_COMPETITOR_NOT_OK", data);
      return null;
    }
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text.trim() : null;
  } catch (e) {
    console.error("OPENAI_PRO_COMPETITOR_ERROR", e);
    return null;
  } finally {
    clearTimeout(id);
  }
}

function isVeryShortInput(s) {
  const t = String(s || "").trim();
  // “ben ve sen” gibi 1-3 kelime: şablona kaçmasın diye özel yol
  return t.length < 18 || t.split(/\s+/).filter(Boolean).length <= 3;
}

export default async function handler(req, res) {
  setCors(res);

  const GENERIC_FAIL_TR = "Şu an yanıt üretilemedi. 10 sn sonra tekrar dener misin?";
  const NEED_LOGIN_TR = "Bu PRO aracı için e-posta ile giriş yapman gerekiyor.";
  const ONLY_PRO_TR = "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek açabilirsin.";

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(200).json({ message: GENERIC_FAIL_TR });

  if (!supabase) {
    console.error("PRO_COMPETITOR_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const langKey = detectLangKey(body.lang || "tr");
  const isTR = langKey === "tr";
  const langName = LANG_MAP[langKey] || "Turkish";

  const email = normalizeEmail(body.email || getHeaderEmail(req));
  const input = String(body.input || "").trim();

  if (!input) {
    return res.status(200).json({
      message: isTR
        ? "Rakip video için şunu yaz: (1) video konusu + (2) hedef kitle + (3) videodaki iddia/mesaj. (Link varsa da olur.)"
        : "Describe the competitor video: topic + audience + main claim (link optional).",
    });
  }

  if (!email) {
    return res.status(200).json({ message: NEED_LOGIN_TR, code: "NEED_LOGIN" });
  }

  // user check
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-competitor):", error);
      return res.status(200).json({ message: GENERIC_FAIL_TR });
    }
    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-competitor):", e);
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  if (!userRow) {
    return res.status(200).json({ message: NEED_LOGIN_TR, code: "USER_NOT_FOUND" });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({ message: ONLY_PRO_TR, code: "PRO_REQUIRED" });
  }

  if (!openaiKey) {
    // fallback (boş dönmesin)
    return res.status(200).json({
      ok: true,
      message: isTR
        ? `Tamam. “${input}” için 3 farklı yaklaşım çıkarırım ama daha net olması için şu 2 şeyi yaz:\n- Video ne vaadediyor? (1 cümle)\n- Kime hitap ediyor? (1 cümle)\n\nŞimdilik hızlı öneri: 0–2 sn net iddia + 2–10 sn 3 madde + 10–15 sn mini kanıt + CTA.`
        : `Got it: “${input}”. Add: (1) promise (1 sentence) (2) audience (1 sentence).`,
    });
  }

  const runId = Date.now().toString(); // her istekte “aynı cevap” riskini kırar

  // Kısa inputsa: şablon basmasın, 3 senaryo üretip seçtirsin
  const shortMode = isVeryShortInput(input);

  const system = `
You are a senior short-form strategist.
Write in ${langName}.
Very important:
- Do NOT output a generic template that looks the same every time.
- Write like a normal chat message (short paragraphs + bullets).
- Make it specific and actionable, with concrete lines to say on screen.
- Give decisive recommendations.

If the input is too vague, do NOT refuse.
Instead, generate 3 plausible scenarios and tailor advice for each scenario, then ask 2 short follow-up questions at the end.

Return structure (no big headings, no emojis spam):
1) Quick diagnosis (2-4 lines)
2) What makes it work (5 bullets, specific)
3) How YOU should beat it (exact improvements, not generic)
4) A ready-to-shoot script (0-2s / 2-6s / 6-12s / 12-18s / 18-25s) with exact on-screen text
5) 6 alternative hooks (first 1-2 seconds)
6) One clear “next action” (what user should do now)
`.trim();

  const user = `
RUN_ID: ${runId}
User input (competitor video or description):
${input}

Mode:
${shortMode ? "INPUT IS VERY SHORT. Create 3 scenarios and tailor outputs." : "INPUT HAS ENOUGH DETAIL. Tailor directly."}

Goal: higher retention + clearer hook + better conversion to follow/favorite/comment.
`.trim();

  const text = await fetchOpenAIChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens: 950,
    timeoutMs: 17000,
  });

  if (!text) return res.status(200).json({ message: GENERIC_FAIL_TR });

  return res.status(200).json({ ok: true, message: text });
      }
