// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi (ESM uyumlu)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

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

export default async function handler(req, res) {
  const GENERIC_FAIL = "Şu an yanıt üretilemedi, lütfen tekrar dene.";

  const NEED_LOGIN_TR =
    "Bu PRO aracı için giriş yapman gerekiyor. (E-posta ile giriş yaptıktan sonra tekrar dene.)";
  const NEED_LOGIN_EN = "You must login with email to use this PRO tool.";

  const ONLY_PRO_TR =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";
  const ONLY_PRO_EN = "This tool is for PRO members only. Upgrade to use it.";

  // OPTIONS (zararsız)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, x-user-email, x-email"
    );
    return res.status(204).end();
  }

  // Sadece POST
  if (req.method !== "POST") {
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!supabase) {
    console.error("PRO_AUDIENCE_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  // Body parse
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const lang = body.lang || "Turkish";
  const isTR = lang === "tr" || lang === "Turkish";

  const email = normalizeEmail(body.email || getHeaderEmail(req));
  const input = String(body.input || "").trim();

  if (!input) {
    return res.status(200).json({
      message: isTR
        ? "Lütfen hedef kitleni tek cümle ile yaz. (Örn: 18–24 yaş, öğrenci, sınav stresi...)"
        : "Please describe your target audience in one sentence.",
    });
  }

  if (!email) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
  }

  // Kullanıcıyı çek
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-audience):", error);
      return res.status(200).json({ message: GENERIC_FAIL });
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-audience):", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!userRow) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
  }

  // 🔴 KRİTİK — PRO DEĞİLSE 403
  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO cevabı
  const message = isTR
    ? "👥 *Kitle İçgörü Analizi (PRO)*\n\n" +
      "HEDEF KİTLE TANIMI:\n---------------------------------\n" +
      input +
      "\n\n" +
      "1) Ana dertler\n" +
      "• Hızlı sonuç ister\n• Uzun videoyu terk eder\n• Boş vaatten bıkmıştır\n\n" +
      "2) Format\n" +
      "• 15–35 sn\n• Tek fikir\n• Büyük yazı\n\n" +
      "3) Hook\n" +
      "• “Eğer sen de [dert] yaşıyorsan…”\n" +
      "• “Kimsenin söylemediği [konu]…”\n\n" +
      "4) CTA\n" +
      "• “Devam için yaz.”\n• “Kaydet.”\n"
    : "👥 PRO – Audience Insight Analysis\n\n" +
      "TARGET AUDIENCE:\n---------------------------------\n" +
      input +
      "\n\n" +
      "• Wants quick wins\n• Drops long content\n• Needs strong first seconds\n";

  return res.status(200).json({ message, ok: true });
}
