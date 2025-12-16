// api/pro-silent.js
// PRO Araç – Sessiz Video İçerik Üreticisi (OpenAI destekli, ESM)

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

async function callOpenAI({ system, user, maxTokens = 1200 }) {
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
    console.error("OPENAI_NOT_OK (pro-silent)", data);
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
    console.error("PRO_SILENT_ENV_MISSING");
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
      message: isTR ? "Lütfen bir konu yaz." : "Please provide a topic.",
    });
  }

  if (!email) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
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
      console.error("Supabase error (pro-silent):", error);
      return res.status(200).json({ message: GENERIC_FAIL });
    }
    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-silent):", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!userRow) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  if (!openaiKey) {
    console.error("OPENAI_API_KEY_MISSING (pro-silent)");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  const system = isTR
    ? `Sen “Sessiz Video” (konuşma yok) uzmanısın. Kullanıcı bir konu verir.
ÇIKTI (Türkçe) şu formatta, 9:16:
1) 3 farklı konsept (Soft / Dengeli / Agresif)
2) Seçilen en iyi konsept için 25-35 sn storyboard:
   - saniye saniye (0-2, 2-5, 5-8...)
   - ekranda yazacak metin (caption)
   - görüntü/b-roll önerisi
3) Başlık + Kapak yazısı (thumbnail text)
4) 10 kısa caption alternatifi (tek satır)
5) Edit talimatı: font, hız, geçiş, vurgu, müzik tipi
6) Yorum sorusu + CTA (kaydet/yorum/takip)
Boş/generic cümle yok.`
    : `You are a “silent video” expert (no voiceover). Provide:
3 concepts, then a 25-35s timestamped storyboard with on-screen text + b-roll,
title + cover text, 10 caption options, editing instructions, CTA + comment question.
No fluff.`;

  const user = isTR
    ? `Konu/Niş: ${input}\nSessiz video için çok detaylı plan üret.`
    : `Topic/Niche: ${input}\nCreate a detailed silent-video plan.`;

  const aiText = await callOpenAI({ system, user, maxTokens: 1250 });
  if (!aiText) return res.status(200).json({ message: GENERIC_FAIL });

  return res.status(200).json({ message: aiText, ok: true });
      }
