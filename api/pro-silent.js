// api/pro-silent.js
// PRO Araç – Sessiz Video İçerik Üreticisi (ESM uyumlu) — OpenAI destekli, çökme önleyici

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

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

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
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  if (!supabase) {
    console.error("PRO_SILENT_ENV_MISSING");
    return res.status(200).json({ message: GENERIC_FAIL_TR });
  }

  const body = safeBody(req);
  const { isTR, langName } = langFlags(body.lang || "Turkish");

  const email = normalizeEmail(body.email || getHeaderEmail(req));
  const inputRaw = String(body.input || "").trim();
  const input = inputRaw.slice(0, 900);

  if (!input) {
    return res.status(200).json({
      message: isTR ? "Bir konu yaz." : "Please provide a topic.",
    });
  }

  if (!email) {
    return res.status(200).json({ message: isTR ? NEED_LOGIN_TR : NEED_LOGIN_EN });
  }

  // Kullanıcıyı bul
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .ilike("email", email)
      .limit(1);

    if (error) {
      console.error("Supabase error (pro-silent):", error);
      return res
        .status(200)
        .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
    }

    userRow = Array.isArray(data) && data.length ? data[0] : null;
  } catch (e) {
    console.error("Supabase exception (pro-silent):", e);
    return res
      .status(200)
      .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
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
    return res.status(200).json({
      ok: true,
      message: isTR
        ? `Konu: ${input}\n\n0–2: …\n2–6: …\n6–15: …\n15–25: …`
        : `Topic: ${input}\n\n0–2: …\n2–6: …\n6–15: …\n15–25: …`,
    });
  }

  try {
    const prompt = isTR
      ? `Sessiz (konuşmasız) kısa video üret.\n\nKONU:\n${input}\n\nİSTEKLER:\n- Sohbet gibi yaz, kısa ama yönlendirici olsun.\n- “PRO” kelimesini yazma, emoji kullanma.\n- 25–35 sn akış: 0-2 / 2-6 / 6-12 / 12-20 / 20-30 / 30-35\n- Her bölüm için: ekranda yazı (kısa), görsel öneri (b-roll), geçiş/tempo notu.\n- 8 alternatif hook (sessiz videoya uygun)\n- 3 farklı bitiş/CTA seçeneği\n- CapCut için 5 hızlı edit ipucu\n`
      : `Create a silent (no-voice) short video.\n\nTOPIC:\n${input}\n\nREQUIREMENTS:\n- Chat-like, short but very actionable.\n- Don’t write “PRO”, no emojis.\n- 25–35 sec flow: 0-2 / 2-6 / 6-12 / 12-20 / 20-30 / 30-35\n- For each segment: on-screen text (short), b-roll idea, pacing/edit note.\n- 8 alternative hooks\n- 3 ending/CTA options\n- 5 quick CapCut editing tips\n`;

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
              content: `You are a practical short-form script writer. Answer in ${langName}. No fluff.`,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
        }),
      },
      12000
    );

    const data = r ? await safeJson(r) : null;

    if (!r || !data || !r.ok) {
      console.error("OPENAI_PRO_SILENT_NOT_OK", { status: r?.status, data });
      return res
        .status(200)
        .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ ok: true, message: text || (isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN) });
  } catch (e) {
    console.error("PRO_SILENT_OPENAI_ERROR", e);
    return res
      .status(200)
      .json({ message: isTR ? GENERIC_FAIL_TR : GENERIC_FAIL_EN });
  }
}
