// api/pro-silent.js
// PRO Araç – Sessiz Video İçerik Üreticisi (ESM uyumlu) — HARDENED + REVIEW-SAFE
// Env:
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

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

function send(res, status, message, extra = {}) {
  return res.status(status).json({ message, ...extra });
}

export default async function handler(req, res) {
  const GENERIC_FAIL = "Şu an yanıt üretilemedi, lütfen tekrar dene.";

  const NEED_LOGIN_TR =
    "Bu PRO aracı için giriş yapman gerekiyor. (E-posta ile giriş yaptıktan sonra tekrar dene.)";
  const NEED_LOGIN_EN = "You must login with email to use this PRO tool.";

  const ONLY_PRO_TR =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";
  const ONLY_PRO_EN = "This tool is for PRO members only. Upgrade to use it.";

  // (Opsiyonel ama güvenli) CORS/Preflight
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
    return send(res, 405, GENERIC_FAIL);
  }

  if (!supabase) {
    console.error(
      "PRO_SILENT_ENV_MISSING: SUPABASE_URL / SUPABASE_SERVICE_KEY"
    );
    return send(res, 500, GENERIC_FAIL);
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

  // input boşsa normal mesaj (200)
  if (!input) {
    return send(
      res,
      200,
      isTR ? "Lütfen bir konu yaz." : "Please provide a topic."
    );
  }

  // email yoksa 401 (frontend: login yönlendirme + pro modal akışı)
  if (!email) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "NEED_LOGIN",
    });
  }

  // Kullanıcıyı bul (duplicate email patlamasın)
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-silent):", error);
      return send(res, 500, GENERIC_FAIL);
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-silent):", e);
    return send(res, 500, GENERIC_FAIL);
  }

  // kullanıcı bulunamadı -> login gibi davran (401)
  if (!userRow) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "USER_NOT_FOUND",
    });
  }

  // PRO kontrol -> değilse 403
  if (!isProUser(userRow)) {
    return send(res, 403, isTR ? ONLY_PRO_TR : ONLY_PRO_EN, {
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO ise içerik üret
  let message = "";

  if (isTR) {
    message =
      "🤫 *Sessiz Video İçerik Üreticisi (PRO)*\n\n" +
      "KONU / NİŞ:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Sessiz Video Tipi\n" +
      "• Sadece yazı + arka plan görüntüleri.\n" +
      "• Emoji/ok/highlight ile vurgu.\n" +
      "• Ses olmadan %100 anlaşılır.\n\n" +
      "2) Sahne Akışı (20–25 sn)\n" +
      "• 0–2 sn  : Büyük başlık – “Bunu kimse göstermiyor: [konu]”\n" +
      "• 2–6 sn  : Madde 1 – kısa cümle + görsel\n" +
      "• 6–10 sn : Madde 2 – kısa cümle + görsel\n" +
      "• 10–15 sn: Madde 3 – mini sır / sonuç\n" +
      "• 15–25 sn: Özet + CTA (kayıt et / takip et)\n\n" +
      "3) Metin Tarzı\n" +
      "• Her sahnede 1 fikir, tek satır.\n" +
      "• Önemli kelimeleri BÜYÜK yaz.\n" +
      "• Etiket kutuları: “HATA / DOĞRU / TAKTİK”\n\n" +
      "4) Konuna Özel 3 Fikir\n" +
      "FİKİR 1 – “3 Adımda [konu]”\n" +
      "• Başlık → 3 kısa adım → CTA\n\n" +
      "FİKİR 2 – “Önce / Sonra”\n" +
      "• ÖNCE: problem → SONRA: çözüm → 2 madde\n\n" +
      "FİKİR 3 – “Yapma / Yap”\n" +
      "• BUNU YAPMA → BUNU YAP → kısa sonuç\n\n" +
      "İstersen hangi platform (TikTok/Reels/Shorts) yaz, süre ve formatı optimize edeyim.";
  } else {
    message =
      "🤫 PRO – Silent Video Content Generator\n\n" +
      "TOPIC / NICHE:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Silent video style\n" +
      "• Text + background footage only.\n" +
      "• Emojis/arrows/highlights for attention.\n" +
      "• 100% understandable without sound.\n\n" +
      "2) Example flow (20–25s)\n" +
      "• 0–2s   : Big headline – “Nobody shows you this about [topic].”\n" +
      "• 2–6s   : Point 1 – 1 short sentence + visual\n" +
      "• 6–10s  : Point 2 – 1 short sentence + visual\n" +
      "• 10–15s : Point 3 – small secret/insight\n" +
      "• 15–25s : Summary + CTA (save/follow)\n\n" +
      "3) Text style\n" +
      "• One idea per scene.\n" +
      "• CAPS for key words.\n" +
      "• Labels: “MISTAKE / FIX / SECRET”\n\n" +
      "Send your platform (TikTok/Reels/Shorts) and I’ll optimize the duration + pacing.";
  }

  return send(res, 200, message, { ok: true });
}
