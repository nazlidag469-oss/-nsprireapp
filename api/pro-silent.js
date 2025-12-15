// api/pro-silent.js
// PRO Araç – Sessiz Video İçerik Üreticisi (ESM uyumlu)

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
  return normalizePlan(userRow.plan) === "pro"; // ✅ sadece plan
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

  if (req.method !== "POST") {
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!supabase) {
    console.error("PRO_SILENT_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

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
      message: isTR ? "Lütfen bir konu yaz." : "Please provide a topic.",
    });
  }

  if (!email) {
    return res.status(200).json({
      message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN,
    });
  }

  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan") // ✅ is_pro kaldırıldı
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

  const message = isTR
    ? "🤫 *Sessiz Video İçerik Üreticisi (PRO)*\n\n" +
      "KONU / NİŞ:\n---------------------------------\n" +
      input +
      "\n\n" +
      "• 0–2 sn: Büyük başlık\n" +
      "• 2–6 sn: Madde 1\n" +
      "• 6–10 sn: Madde 2\n" +
      "• 10–15 sn: Madde 3\n" +
      "• 15–25 sn: Özet + CTA\n"
    : "🤫 PRO – Silent Video Content Generator\n\nTOPIC:\n" + input;

  return res.status(200).json({ message, ok: true });
}
