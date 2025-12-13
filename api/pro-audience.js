// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi (ESM uyumlu) — HARDENED + REVIEW-SAFE
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

  // Env kontrol
  if (!supabase) {
    console.error(
      "PRO_AUDIENCE_ENV_MISSING: SUPABASE_URL / SUPABASE_SERVICE_KEY"
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

  // Boş input -> temiz mesaj (200)
  if (!input) {
    return send(
      res,
      200,
      isTR
        ? "Lütfen hedef kitleni tek cümle ile yaz. (Örn: 18–24 yaş, öğrenci, sınav stresi...)"
        : "Please describe your target audience in one sentence."
    );
  }

  // Email yoksa -> 401
  if (!email) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "NEED_LOGIN",
    });
  }

  // Kullanıcıyı çek (duplicate email patlamasın)
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-audience):", error);
      return send(res, 500, GENERIC_FAIL);
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-audience):", e);
    return send(res, 500, GENERIC_FAIL);
  }

  // Kullanıcı yok -> 401
  if (!userRow) {
    return send(res, 401, isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN, {
      code: "USER_NOT_FOUND",
    });
  }

  // PRO değil -> 403
  if (!isProUser(userRow)) {
    return send(res, 403, isTR ? ONLY_PRO_TR : ONLY_PRO_EN, {
      code: "PRO_REQUIRED",
    });
  }

  // ✅ PRO ise içerik üret
  let message = "";

  if (isTR) {
    message =
      "👥 *Kitle İçgörü Analizi (PRO)*\n\n" +
      "HEDEF KİTLE TANIMI:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Bu kitlenin ana dertleri\n" +
      "• Zaman: “Kısa sürede sonuç görmek istiyorlar.”\n" +
      "• Enerji: “Uzun, sıkıcı videoları yarıda bırakıyorlar.”\n" +
      "• Güven: “Boş vaatlerden sıkılmış durumdalar.”\n\n" +
      "2) Video Format Tercihleri\n" +
      "• 15–35 saniyelik kısa videolar.\n" +
      "• Net başlık, net sonuç. Arada kaynamayan bilgi.\n" +
      "• Dik format, mobil ekrana uygun, büyük yazılar.\n\n" +
      "3) Onlara Uyan Hook Kalıpları\n" +
      "• “Eğer sen de [derdi] yaşıyorsan, bu video tam sana göre.”\n" +
      "• “Kimsenin söylemediği [niş konu] gerçeğini göstereyim.”\n" +
      "• “Şu 3 hatayı yapıyorsan, [sonuç] gelmemesi normal.”\n\n" +
      "4) CTA Örnekleri\n" +
      "• “Bu tarz videoların devamı için ‘devam’ yaz.”\n" +
      "• “Bu bilgiyi kaybetmemek için videoyu kaydet.”\n" +
      "• “Bunu görmesi gereken bir arkadaşını etiketle.”\n\n" +
      "5) Mini İçerik Stratejisi\n" +
      "• Pzt–Cum: her gün 1 hızlı ipucu (15–20 sn)\n" +
      "• Hafta sonu: 1 story video (30–45 sn)\n" +
      "• Ayda 1: “Bu ay neleri denedim?” özet video\n\n" +
      "Yaş aralığı + ülke + platformu yazarsan daha keskin plan çıkarayım.";
  } else {
    message =
      "👥 PRO – Audience Insight Analysis\n\n" +
      "TARGET AUDIENCE DESCRIPTION:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Main pains / frustrations\n" +
      "• Time: quick wins, short videos.\n" +
      "• Energy: they drop long/slow content.\n" +
      "• Trust: tired of fake promises.\n\n" +
      "2) Preferred format\n" +
      "• 15–35 second videos with one clear idea.\n" +
      "• Strong title + strong visual in the first 2–3 seconds.\n" +
      "• Vertical, readable subtitles, fast cuts.\n\n" +
      "3) Hook patterns\n" +
      "• “If you struggle with [pain], watch this.”\n" +
      "• “Here’s what nobody tells you about [topic].”\n" +
      "• “If you make these 3 mistakes, no wonder [result] never happens.”\n\n" +
      "4) CTA examples\n" +
      "• “Comment ‘more’ for part 2.”\n" +
      "• “Save this so you don’t forget.”\n" +
      "• “Send this to a friend who needs it.”\n\n" +
      "Share age/location/platform next time and we’ll build a deeper strategy.";
  }

  return send(res, 200, message, { ok: true });
}
