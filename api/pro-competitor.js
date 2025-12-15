// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi (ESM uyumlu)

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
  const p1 = normalizePlan(userRow.plan); // ✅ sadece plan
  if (p1 === "pro") return true;
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
    console.error("PRO_COMPETITOR_ENV_MISSING");
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
        ? "Lütfen rakip video linki veya açıklaması yaz."
        : "Please paste the competitor video link or description.",
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
      .select("id, email, plan, is_pro") // ✅ Plan kaldırıldı
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
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
  }

  // 🔴 KRİTİK NOKTA — PRO DEĞİLSE 403
  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO cevabı
  const message = isTR
    ? "🎯 *Rakip Video Analizi (PRO)*\n\n" +
      "GÖNDERİLEN VİDEO / AÇIKLAMA:\n---------------------------------\n" +
      input +
      "\n\n" +
      "1) Neden İzleniyor?\n" +
      "• Güçlü hook\n• Hızlı tempo\n• Net yapı\n\n" +
      "2) Nasıl Daha İyi Yapılır?\n" +
      "• İlk 2 saniyede büyük vaat\n• Daha agresif giriş\n• Caption senkronu\n\n" +
      "3) Şablon\n" +
      "• Hook → Problem → Mini çözüm → CTA\n"
    : "🎯 PRO – Competitor Video Analysis\n\n" +
      "INPUT:\n---------------------------------\n" +
      input +
      "\n\n" +
      "• Strong hook\n• Fast pacing\n• Clear structure\n";

  return res.status(200).json({ message, ok: true });
      }
