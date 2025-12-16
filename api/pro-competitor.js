// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi (ESM uyumlu) — DAHA DETAYLI + DAHA HIZLI (OpenAI yok)

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

  // OPTIONS (CORS)
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
      code: "NEED_LOGIN",
    });
  }

  // Kullanıcıyı bul (daha hızlı: eq)
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .eq("email", email)
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
      code: "USER_NOT_FOUND",
    });
  }

  // PRO değilse 403
  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // ✅ DAHA DETAYLI CEVAP (Hızlı: sabit şablon, ama yönlendirici)
  const msgTR =
    "Rakip içerik analizi (detaylı):\n\n" +
    "A) İzlenme sebebi (en sık 3 tetikleyici)\n" +
    "• İlk 2 saniye merak/vaat (izleyiciyi kilitler)\n" +
    "• Tek fikir – tek problem (kafa karıştırmaz)\n" +
    "• Tempo: 2–4 sn’de bir sahne/zoom/kesme\n\n" +
    "B) Sende aynısını daha iyi yapmak için net reçete\n" +
    "1) Hook (0–2 sn)\n" +
    "• Büyük vaat + hedef kitle: “Eğer [hedef] isen, bunu kaçırma…”\n" +
    "• Ters köşe: “Herkes yanlış yapıyor, doğrusu şu…”\n" +
    "• Sayı: “3 adımda…” / “10 saniyede…”\n\n" +
    "2) Akış (2–15 sn)\n" +
    "• Problem (2–4 sn): “Şu yüzden olmuyor…”\n" +
    "• Mini çözüm (4–12 sn): 2–3 madde (her madde 2–3 sn)\n" +
    "• Kanıt (12–15 sn): mini örnek / önce-sonra / ekran kaydı\n\n" +
    "3) Caption/Metin (ekran yazısı)\n" +
    "• 5–7 kelimeyi geçme\n" +
    "• Her cümleyi 1 satır yap\n" +
    "• Ana kelimeyi büyüt: [KAZANÇ], [HATA], [ÇÖZÜM]\n\n" +
    "4) CTA (son 2 sn)\n" +
    "• “Devamını istiyorsan ‘DEVAM’ yaz.”\n" +
    "• “Kaydet – sonra lazım olacak.”\n" +
    "• “Part 2 gelsin mi?”\n\n" +
    "C) Hızlı şablon (kopyala-yapıştır)\n" +
    "Hook → Problem → 3 Madde → Mini örnek → CTA\n\n" +
    "D) Benden daha net sonuç almak için\n" +
    "• Linkse: videonun konusu + hedef kitleyi 1 cümle yaz\n" +
    "• Açıklamaysa: ‘konu / kime / amaç’ şeklinde yaz\n";

  const msgEN =
    "Competitor analysis (detailed):\n\n" +
    "A) Why it gets views\n" +
    "• Strong first 2 seconds (promise/curiosity)\n" +
    "• One clear idea (no confusion)\n" +
    "• Fast pacing (cut/zoom every 2–4s)\n\n" +
    "B) Do it better (recipe)\n" +
    "1) Hook (0–2s): big promise / twist / number\n" +
    "2) Flow (2–15s): problem → 2–3 quick points → mini proof\n" +
    "3) Captions: short lines, highlight keywords\n" +
    "4) CTA: comment/save/part2\n\n" +
    "Template: Hook → Problem → 3 Points → Proof → CTA\n";

  return res.status(200).json({
    ok: true,
    message: isTR ? msgTR : msgEN,
  });
}
