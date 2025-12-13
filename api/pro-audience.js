// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi (ESM uyumlu) — REVIEW-SAFE (200-only)
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY

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

  // Preflight (opsiyonel, zararsız)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, x-user-email, x-email"
    );
    return res.status(204).end();
  }

  // Review-safe: sadece 200 döndür
  if (req.method !== "POST") {
    return res.status(200).json({ message: GENERIC_FAIL, code: "GENERIC" });
  }

  if (!supabase) {
    console.error("PRO_AUDIENCE_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL, code: "GENERIC" });
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
      code: "EMPTY_INPUT",
    });
  }

  if (!email) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
      code: "NEED_LOGIN",
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
      return res.status(200).json({ message: GENERIC_FAIL, code: "GENERIC" });
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-audience):", e);
    return res.status(200).json({ message: GENERIC_FAIL, code: "GENERIC" });
  }

  if (!userRow) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
      code: "USER_NOT_FOUND",
    });
  }

  if (!isProUser(userRow)) {
    return res.status(200).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO ise içerik üret
  const message = isTR
    ? "👥 *Kitle İçgörü Analizi (PRO)*\n\n" +
      "HEDEF KİTLE TANIMI:\n---------------------------------\n" +
      input +
      "\n\n" +
      "1) Bu kitlenin ana dertleri\n" +
      "• Zaman: hızlı sonuç ister.\n" +
      "• Enerji: uzun videoyu terk eder.\n" +
      "• Güven: boş vaatten sıkılmıştır.\n\n" +
      "2) Format Tercihi\n" +
      "• 15–35 sn, tek fikir.\n" +
      "• Büyük yazı + hızlı tempo.\n\n" +
      "3) Hook Kalıpları\n" +
      "• “Eğer sen de [dert] yaşıyorsan…”\n" +
      "• “Kimsenin söylemediği [konu]…”\n" +
      "• “Bu 3 hatayı yapıyorsan…”\n\n" +
      "4) CTA\n" +
      "• “Devam istiyorsan ‘devam’ yaz.”\n" +
      "• “Kaydet, sonra uygula.”\n\n" +
      "Yaş + ülke + platform yazarsan daha net plan çıkarayım."
    : "👥 PRO – Audience Insight Analysis\n\n" +
      "TARGET AUDIENCE:\n---------------------------------\n" +
      input +
      "\n\n" +
      "• Pains: wants quick wins, drops long content, tired of fake promises.\n" +
      "• Format: 15–35s, one clear idea, strong first 2–3s.\n" +
      "• CTA: comment ‘more’, save, send to a friend.\n";

  return res.status(200).json({ message, ok: true });
  }
