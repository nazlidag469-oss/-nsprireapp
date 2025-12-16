// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi (ESM uyumlu) — OpenAI destekli, çökme önleyici

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

// CORS helper
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-user-email, x-email"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

// Body parse (string gelebilir)
function safeBody(req) {
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body && typeof body === "object" ? body : {};
}

// ✅ Timeout’lu fetch
async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// ✅ JSON bazen boş/yarım dönebilir
async function safeJson(response) {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function langFlags(langRaw) {
  const v = String(langRaw || "").trim();
  const low = v.toLowerCase();
  const isTR = low === "tr" || low === "turkish" || low === "türkçe";
  const langName = isTR ? "Turkish" : "English";
  return { isTR, langName };
}

export default async function handler(req, res) {
  setCors(res);

  const GENERIC_FAIL_TR = "Şu an yanıt üretilemedi, lütfen tekrar dene.";
  const GENERIC_FAIL_EN = "Could not generate a response right now. Please try again.";

  const NEED_LOGIN_TR =
    "Bu PRO aracı için giriş yapman gerekiyor. (E-posta ile giriş yaptıktan sonra tekrar dene.)";
  const NEED_LOGIN_EN = "You must login with email to use this PRO tool.";

  const ONLY_PRO_TR =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";
  const ONLY_PRO_EN = "This tool is for PRO members only. Upgrade to use it.";

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    // client tarafı bozulmasın diye 200 dönüyoruz
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  if (!supabase) {
    console.error("PRO_AUDIENCE_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  const body = safeBody(req);
  const { isTR, langName } = langFlags(body.lang || "Turkish");

  const email = normalizeEmail(body.email || getHeaderEmail(req));
  const inputRaw = String(body.input || "").trim();

  // input çok uzarsa şişmesin
  const input = inputRaw.slice(0, 1200);

  if (!input) {
    return res.status(200).json({
      message: isTR
        ? "Hedef kitleni tek cümleyle yaz. (Örn: 18–24, öğrenci, sınav stresi…) "
        : "Describe your target audience in one sentence.",
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
      return res
        .status(200)
        .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
    }
    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-audience):", e);
    return res
      .status(200)
      .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
  }

  if (!userRow) {
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
  }

  // PRO değilse 403
  if (!isProUser(userRow)) {
    return res.status(403).json({
      message: isTR ? ONLY_PRO_TR : ONLY_PRO_EN,
      code: "PRO_REQUIRED",
    });
  }

  // OpenAI yoksa yine de patlamasın: kısa ama düzgün fallback
  if (!openaiKey) {
    return res.status(200).json({
      ok: true,
      message: isTR
        ? `Hedef kitle: ${input}\n\n1) En büyük dert: …\n2) En güçlü vaat: …\n3) 5 hook: …`
        : `Target audience: ${input}\n\n1) Main pain: …\n2) Strong promise: …\n3) 5 hooks: …`,
    });
  }

  // ✅ OpenAI ile “sohbet gibi” cevap (PRO yazma, emoji yok)
  try {
    const prompt = isTR
      ? `Aşağıdaki hedef kitle tanımına göre içerik stratejisi çıkar.\n\nHEDEF KİTLE:\n${input}\n\nİSTEKLER:\n- Cevap kısa ve sohbet gibi olsun, ama yönlendirici ve dolu olsun.\n- “PRO” kelimesini yazma, başlıkları abartma.\n- 1) Persona (1 paragraf)\n- 2) Dertler & itirazlar (madde)\n- 3) Vaad/konumlandırma (madde)\n- 4) 10 hook cümlesi\n- 5) 7 günlük içerik planı (gün/gün, 1 satır)\n- 6) 3 hızlı A/B test fikri\n`
      : `Create a content strategy for this target audience.\n\nAUDIENCE:\n${input}\n\nREQUIREMENTS:\n- Keep it short and chat-like, but actionable and dense.\n- Don’t write the word “PRO”.\n- 1) Persona (1 paragraph)\n- 2) Pains & objections (bullets)\n- 3) Positioning/promise (bullets)\n- 4) 10 hook lines\n- 5) 7-day content plan (day by day, 1 line)\n- 6) 3 quick A/B test ideas\n`;

    const r = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a practical short-form video coach. Answer in ${langName}. No fluff, no long intros.`,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 700,
        }),
      },
      12000
    );

    const data = r ? await safeJson(r) : null;

    if (!r || !data || !r.ok) {
      console.error("OPENAI_PRO_AUDIENCE_NOT_OK", { status: r?.status, data });
      return res
        .status(200)
        .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ ok: true, message: text || (isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN) });
  } catch (e) {
    console.error("PRO_AUDIENCE_OPENAI_ERROR", e);
    return res
      .status(200)
      .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
  }
      }
