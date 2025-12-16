// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi (OpenAI destekli, ESM)

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
    console.error("OPENAI_NOT_OK (pro-audience)", data);
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
    console.error("PRO_AUDIENCE_ENV_MISSING");
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
        ? "Lütfen hedef kitleni tek cümle ile yaz. (Örn: 18–24 yaş, öğrenci, sınav stresi...)"
        : "Please describe your target audience in one sentence.",
    });
  }

  if (!email) {
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
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
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  if (!openaiKey) {
    console.error("OPENAI_API_KEY_MISSING (pro-audience)");
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  const system = isTR
    ? `Sen kısa video büyütme uzmanısın. Kullanıcı sana hedef kitleyi tek cümle verir.
ÇIKTI (Türkçe) şu başlıklarda, çok dolu ve uygulanabilir olsun:
1) Kitleyi 3 Persona'ya böl (isim, yaş, hedef, korku, izleme nedeni)
2) Pain Point Haritası (5 ana acı + günlük hayattan örnek)
3) Hook bankası: 15 farklı ilk cümle (kitleye özel)
4) İçerik sütunları: 5 pillar + her biri için 3 video fikri (toplam 15)
5) CTA ve yorum taktikleri (kaydet, takip, yorum sorusu; 10 örnek)
6) 7 günlük mini yayın planı (gün/gün konu + hedef metrik)
7) “Bu kitleye yanlış gelen şeyler” (5 madde)
Boş laf yok.`
    : `You are a short-form growth expert. Given one-line target audience, produce:
3 personas, pain map, 15 hooks, 5 content pillars with 15 ideas, CTA/comment tactics,
7-day plan, and 5 common mistakes. No fluff.`;

  const user = isTR
    ? `Hedef kitle tanımı:\n${input}\n\nBuna göre detaylı kitle içgörüsü ve uygulanabilir plan çıkar.`
    : `Target audience:\n${input}\n\nReturn detailed, actionable audience insights and plan.`;

  const aiText = await callOpenAI({ system, user, maxTokens: 1250 });
  if (!aiText) return res.status(200).json({ message: GENERIC_FAIL });

  return res.status(200).json({ message: aiText, ok: true });
    }
