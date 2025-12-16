// pages/api/ideas.js

const LANG_MAP = {
  tr: "Turkish",
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  fa: "Persian",
  hi: "Hindi",
  id: "Indonesian",
  ms: "Malay",
  th: "Thai",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  pl: "Polish",
};

// CORS helper
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function detectLangKey(langRaw) {
  if (!langRaw) return "tr";
  const val = String(langRaw).toLowerCase();
  if (LANG_MAP[val]) return val;

  for (const [code, name] of Object.entries(LANG_MAP)) {
    if (name.toLowerCase() === val) return code;
  }
  return "tr";
}

// ✅ JSON bazen boş/yarım dönebilir → güvenli parse
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

// ✅ Timeout’lu fetch
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json({ message: "Bu endpoint POST ile çalışır." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS, GET");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  // ✅ Body bazen string gelir → güvenli parse
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { prompt, platform, lang, mode, format } = body || {};

  // ✅ prompt aşırı uzarsa server/UI kilitlenmesin
  const topicRaw = (prompt || "").toString().trim();
  const topic = (topicRaw.slice(0, 800) || "Belirsiz konu");

  const langKey = detectLangKey(lang || "tr");
  const langName = LANG_MAP[langKey] || "Turkish";

  const GENERIC_FAIL =
    langKey === "tr"
      ? "Şu an içerik üretilemedi. Lütfen birkaç dakika sonra tekrar dene."
      : "Content could not be generated right now. Please try again in a few minutes.";

  let platformSafe = (platform || "youtube").toString().toLowerCase();
  if (!["youtube", "tiktok", "instagram"].includes(platformSafe)) {
    platformSafe = "youtube";
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return res.status(200).json({ message: GENERIC_FAIL });

  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const rapidKey = process.env.RAPIDAPI_KEY;

  let extraContext = "";

  // ✅ YouTube (maks 2.5s) — olmazsa geç
  if (youtubeKey) {
    try {
      const url =
        "https://www.googleapis.com/youtube/v3/search?part=snippet" +
        "&maxResults=3" +
        "&q=" +
        encodeURIComponent(topic) +
        "&type=video" +
        "&key=" +
        youtubeKey;

      const r = await fetchWithTimeout(url, {}, 2500);
      const d = r ? await safeJson(r) : null;

      const titles = d?.items?.map((v) => v.snippet?.title).filter(Boolean) || [];

      if (titles.length) {
        extraContext +=
          "\nYouTube'da benzer video başlıkları:\n- " +
          titles.slice(0, 3).join("\n- ") +
          "\n";
      }
    } catch (e) {
      console.error("YOUTUBE_CONTEXT_ERROR", e);
    }
  }

  // ✅ RapidAPI (maks 2.5s) — boş/yarım JSON gelirse patlamasın
  if (rapidKey && (platformSafe === "tiktok" || platformSafe === "instagram")) {
    try {
      let url = "";
      let headers = { "x-rapidapi-key": rapidKey };
      let method = "GET";
      let body2 = undefined;

      if (platformSafe === "tiktok") {
        url =
          "https://tiktok-api23.p.rapidapi.com/api/search/account?keyword=" +
          encodeURIComponent(topic) +
          "&cursor=0&search_id=0";
        headers["x-rapidapi-host"] = "tiktok-api23.p.rapidapi.com";
      } else {
        url = "https://instagram120.p.rapidapi.com/api/instagram/posts";
        headers["x-rapidapi-host"] = "instagram120.p.rapidapi.com";
        headers["Content-Type"] = "application/json";
        method = "POST";
        body2 = JSON.stringify({ username: topic, maxId: "" });
      }

      const r = await fetchWithTimeout(url, { method, headers, body: body2 }, 2500);
      const d = r ? await safeJson(r) : null;

      if (d) {
        extraContext +=
          "\n" +
          platformSafe.toUpperCase() +
          " tarafında örnek API verisi (kısaltılmış):\n" +
          JSON.stringify(d).slice(0, 500) +
          "\n";
      }
    } catch (e) {
      console.error("RAPIDAPI_CONTEXT_ERROR", e);
    }
  }

  // ✅ extraContext büyümesin (OpenAI tarafında gecikme/limit olur)
  if (extraContext.length > 1200) extraContext = extraContext.slice(0, 1200);

  // ✅ OpenAI (timeout + safeJson)
  try {
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sen kısa video üreticileri için çalışan profesyonel bir içerik koçusun. " +
            "Cevabı her zaman " +
            langName +
            " dilinde ver. Dikey 9:16 formatına göre yaz. " +
            "Boş cümle yok, net ve uygulanabilir yaz.",
        },
        {
          role: "user",
          content:
            `Konu: ${topic}\n` +
            `Platform: ${platformSafe}\n` +
            `İstenen format: ${format || "dikey 9:16 kısa video"}\n` +
            (mode ? `Kullanıcının modu / hedefi: ${mode}\n` : "") +
            `Ek bağlam:\n${extraContext}`,
        },
      ],
      max_tokens: 450, // hız için
    };

    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      12000 // ✅ OpenAI için 12s
    );

    const data = response ? await safeJson(response) : null;

    if (!response || !data) {
      console.error("OPENAI_NO_JSON_OR_TIMEOUT");
      return res.status(200).json({ message: GENERIC_FAIL });
    }

    if (!response.ok) {
      console.error("OPENAI_RESPONSE_NOT_OK", { status: response.status, data });
      return res.status(200).json({ message: GENERIC_FAIL });
    }

    const text =
      data?.choices?.[0]?.message?.content ||
      (langKey === "tr"
        ? "Herhangi bir içerik üretilmedi. Lütfen biraz sonra tekrar dene."
        : "No content was generated. Please try again shortly.");

    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("IDEAS_API_ERROR", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }
    }
