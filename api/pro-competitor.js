// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi (ESM uyumlu) — HARDENED + REVIEW-SAFE
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
  const s = String(v || "").trim().toLowerCase();
  return s;
}

function isProUser(userRow) {
  if (!userRow) return false;

  // plan alanları farklı isimlerle gelebilir
  const p1 = normalizePlan(userRow.plan);
  const p2 = normalizePlan(userRow.Plan);
  if (p1 === "pro" || p2 === "pro") return true;

  // boolean flag
  if (userRow.is_pro === true) return true;

  return false;
}

function getHeaderEmail(req) {
  // Node/Serverless header keys çoğu zaman lower-case gelir
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
  const NEED_LOGIN_EN =
    "You must login with email to use this PRO tool.";

  const ONLY_PRO_TR =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";
  const ONLY_PRO_EN =
    "This tool is for PRO members only. Upgrade to use it.";

  // (Opsiyonel ama güvenli) CORS/Preflight: Android WebView / bazı hostlarda lazım olabilir
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email, x-email");
    return res.status(204).end();
  }

  // Sadece POST
  if (req.method !== "POST") {
    return send(res, 405, GENERIC_FAIL);
  }

  if (!supabase) {
    console.error(
      "PRO_COMPETITOR_ENV_MISSING: SUPABASE_URL / SUPABASE_SERVICE_KEY"
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

  if (!input) {
    return send(
      res,
      200,
      isTR
        ? "Lütfen rakip video linki veya açıklaması yaz."
        : "Please paste the competitor video link or description."
    );
  }

  // Email yoksa 401 (frontend bunu PRO_REQUIRED gibi ele alacak)
  if (!email) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "NEED_LOGIN",
    });
  }

  // Kullanıcıyı bul (duplicate email olsa bile patlamasın diye array çekiyoruz)
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-competitor):", error);
      return send(res, 500, GENERIC_FAIL);
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-competitor):", e);
    return send(res, 500, GENERIC_FAIL);
  }

  // Kullanıcı yoksa -> login gibi davran (401)
  if (!userRow) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "USER_NOT_FOUND",
    });
  }

  // PRO değilse 403 (frontend bunu PRO_REQUIRED yakalayacak)
  if (!isProUser(userRow)) {
    return send(res, 403, isTR ? ONLY_PRO_TR : ONLY_PRO_EN, {
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO ise cevap üret
  let message = "";

  if (isTR) {
    message =
      "🎯 *Rakip Video Analizi (PRO)*\n\n" +
      "GÖNDERİLEN VİDEO / AÇIKLAMA:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Neden İzleniyor / Tuttu?\n" +
      "• Başlangıçta net bir merak veya problem var.\n" +
      "• Tempo yüksek, boşluk az.\n" +
      "• Akış: hook → problem → mini sır/çözüm → çağrı.\n" +
      "• Görsel ritim (cut/zoom/yazı) dikkati taşıyor.\n\n" +
      "2) Hook’u Daha Güçlü Yapmak İçin\n" +
      "• İlk 2 saniyede büyük vaadi söyle.\n" +
      "• Daha iddialı/merak uyandıran ilk cümle kullan.\n" +
      "• Caption’ı sesle senkron yap, ilk cümlede büyük font.\n\n" +
      "3) Nişine Uygulama Şablonu\n" +
      "• (0–3 sn) “Bugün sana kimsenin anlatmadığı: [konu]”\n" +
      "• (3–15 sn) 2–3 madde: problem → mini çözüm\n" +
      "• (15–30 sn) “Devam istiyorsan ‘devam’ yaz.”\n\n" +
      "4) Hook Örnekleri\n" +
      "• “Bunu yapıyorsan videonun tutmaması normal.”\n" +
      "• “33 saniyede kimsenin söylemediği taktiği göstereceğim.”\n" +
      "• “Bunu bilmeden video çekme.”\n\n" +
      "İstersen rakip videonun metnini yapıştır, sana özel senaryo + kopya çıkarayım.";
  } else {
    message =
      "🎯 PRO – Competitor Video Analysis\n\n" +
      "INPUT VIDEO / DESCRIPTION:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Why it performs well\n" +
      "• Strong curiosity/problem in the first seconds.\n" +
      "• High tempo, low dead time.\n" +
      "• Clear structure: hook → problem → insight → CTA.\n\n" +
      "2) How to improve the hook\n" +
      "• State the main promise in the first 2 seconds.\n" +
      "• Make the first sentence more polarizing/curious.\n" +
      "• Sync captions with voice and use big bold text early.\n\n" +
      "3) Template\n" +
      "• (0–3s) “Let me show you a [topic] trick nobody talks about.”\n" +
      "• (3–15s) 2–3 bullets: pain → quick fix\n" +
      "• (15–30s) “Comment ‘more’ for part 2.”\n\n" +
      "Paste the full transcript next time and I’ll rewrite it for your style.";
  }

  return send(res, 200, message, { ok: true });
                }
