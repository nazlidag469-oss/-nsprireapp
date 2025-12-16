// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi (OpenAI destekli, ESM)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

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

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-user-email, x-email"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

async function callOpenAI({ system, user, maxTokens = 1100 }) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    console.error("OPENAI_NOT_OK (pro-competitor)", data);
    return null;
  }
  return data?.choices?.[0]?.message?.content || null;
}

export default async function handler(req, res) {
  const GENERIC_FAIL = "Şu an yanıt üretilemedi, lütfen tekrar dene.";

  const NEED_LOGIN_TR =
    "Bu PRO aracı için giriş yapman gerekiyor. (E-posta ile giriş yaptıktan sonra tekrar dene.)";
  const NEED_LOGIN_EN = "You must login with email to use this PRO tool.";

  const ONLY_PRO_TR =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";
  const ONLY_PRO_EN = "This tool is for PRO members only. Upgrade to use it.";

  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(200).json({ message: GENERIC_FAIL });

  if (!supabase) {
    console.error("PRO_COMPETITOR_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const lang = body.lang || "Turkish";
  const isTR = lang === "tr" || lang === "Turkish";

  const email = normalizeEmail(body.email || getHeaderEmail(req));
  const input = String(body.input || "").trim();

  if (!input) {
    return res.status(200).json({
      message: isTR
        ? "Lütfen rakip video linki veya açıklaması yaz."
        : "Please paste the competitor video link or description.",
    });
  }

  if (!email) {
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
  }

  // Kullanıcıyı bul
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-competitor):", error);
      return res.status(200).json({ message: GENERIC_FAIL });
    }
    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-competitor):", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!userRow) {
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // OpenAI yoksa (env) fallback
  if (!openaiKey) {
    console.error("OPENAI_API_KEY_MISSING (pro-competitor)");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  const system = isTR
    ? `Sen üst düzey bir kısa video (TikTok/Reels/Shorts) büyüme stratejisti ve editörsün.
Kullanıcı sana "rakip video linki veya açıklaması" verir. Sen linke gidemesen bile metinden hareketle PROFESYONEL analiz çıkarırsın.
ÇIKTI FORMATIN (Türkçe, çok net, madde madde):
1) Rakibin HOOK'u (ilk 2 saniye) — tahmin + 3 alternatif hook
2) Yapı Analizi (0-3 / 3-8 / 8-15 / 15-25 / kapanış)
3) Neden İzleniyor? (psikoloji + pacing + görsel + caption)
4) Aynısını Yapma, Daha İyisini Yap: 7 somut iyileştirme (uygulanabilir)
5) Senaryonu Yaz: 25 saniyelik script (konuşma metni + ekranda yazacak caption)
6) Çekim planı: sahne sahne (kamera, açı, b-roll, geçiş)
7) Edit rehberi: ritim, altyazı stili, efekt dozajı, müzik öneri tipi
8) 3 Başlık + 10 hashtag (TR)
Asla boş laf etme. "Genel" cümle yok.`
    : `You are an elite short-video growth strategist.
Return highly actionable analysis in English with:
hook breakdown + 3 hook variations, structure timeline, why it works,
7 improvements, a 25s script + on-screen captions, shot list, editing guide,
3 titles + 10 hashtags. No generic fluff.`;

  const user = isTR
    ? `Rakip video linki/açıklaması:\n${input}\n\nBunu analiz et ve bana "kopyalamadan daha iyisini" üretecek planı ver.`
    : `Competitor link/description:\n${input}\n\nAnalyze and give me a plan to outperform it (not copy).`;

  const aiText = await callOpenAI({ system, user, maxTokens: 1200 });

  if (!aiText) return res.status(200).json({ message: GENERIC_FAIL });

  return res.status(200).json({ message: aiText, ok: true });
}
