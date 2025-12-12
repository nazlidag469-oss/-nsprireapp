// pages/api/ideas.js
// Kısa video içerik koçu – YouTube / TikTok / Instagram verileriyle desteklenmiş fikir üretimi

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

// Gelen lang değerinden "tr", "en" vs. tespit et
function detectLangKey(langRaw) {
  if (!langRaw) return "tr";
  const val = String(langRaw).toLowerCase();

  // Zaten kısaltma geldiyse (tr, en...)
  if (LANG_MAP[val]) return val;

  // "Turkish", "English" gibi geldiyse map'le
  for (const [code, name] of Object.entries(LANG_MAP)) {
    if (name.toLowerCase() === val) return code;
  }
  return "tr";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { prompt, platform, lang, mode, format } = req.body || {};
  const topic = (prompt || "").toString().trim() || "Belirsiz konu";

  const langKey = detectLangKey(lang || "tr");
  const langName = LANG_MAP[langKey] || "Turkish";

  // Kullanıcıya göstereceğimiz genel, kibar hata mesajı
  const GENERIC_FAIL =
    langKey === "tr"
      ? "Şu an içerik üretilemedi. Lütfen birkaç dakika sonra tekrar dene."
      : "Content could not be generated right now. Please try again in a few minutes.";

  let platformSafe = (platform || "youtube").toString().toLowerCase();
  if (!["youtube", "tiktok", "instagram"].includes(platformSafe)) {
    platformSafe = "youtube";
  }

  // --- ENV ---
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    // Teknik detayı gizle, sadece kullanıcı dostu mesaj
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const rapidKey = process.env.RAPIDAPI_KEY;

  let extraContext = "";

  // --- YouTube bağlamı (isteğe bağlı) ---
  if (youtubeKey) {
    try {
      const url =
        "https://www.googleapis.com/youtube/v3/search?part=snippet" +
        "&maxResults=5" +
        "&q=" +
        encodeURIComponent(topic) +
        "&type=video" +
        "&key=" +
        youtubeKey;

      const r = await fetch(url);
      const d = await r.json();
      const titles =
        d.items?.map((v) => v.snippet?.title).filter(Boolean) || [];

      if (titles.length) {
        extraContext +=
          "\nYouTube'da benzer video başlıkları:\n- " +
          titles.slice(0, 5).join("\n- ") +
          "\n";
      }
    } catch (e) {
      console.error("YOUTUBE_CONTEXT_ERROR", e);
      // YouTube hatası olursa sessiz geç
    }
  }

  // --- TikTok / Instagram RapidAPI bağlamı (isteğe bağlı, varsa) ---
  if (rapidKey && (platformSafe === "tiktok" || platformSafe === "instagram")) {
    try {
      let url = "";
      let headers = {
        "x-rapidapi-key": rapidKey,
      };
      let method = "GET";
      let body = undefined;

      if (platformSafe === "tiktok") {
        url =
          "https://tiktok-api23.p.rapidapi.com/api/search/account?keyword=" +
          encodeURIComponent(topic) +
          "&cursor=0&search_id=0";
        headers["x-rapidapi-host"] = "tiktok-api23.p.rapidapi.com";
      } else if (platformSafe === "instagram") {
        url = "https://instagram120.p.rapidapi.com/api/instagram/posts";
        headers["x-rapidapi-host"] = "instagram120.p.rapidapi.com";
        headers["Content-Type"] = "application/json";
        method = "POST";
        body = JSON.stringify({ username: topic, maxId: "" });
      }

      const r = await fetch(url, { method, headers, body });
      const d = await r.json();

      extraContext +=
        "\n" +
        platformSafe.toUpperCase() +
        " tarafında örnek API verisi (kısaltılmış):\n" +
        JSON.stringify(d || {}).slice(0, 800) +
        "\n";
    } catch (e) {
      console.error("RAPIDAPI_CONTEXT_ERROR", e);
      // RapidAPI hatası olursa da sessiz geç
    }
  }

  // --- OpenAI ile asistan cevabı ---
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content:
              "Sen kısa video üreticileri için çalışan profesyonel bir içerik koçusun. " +
              "Kullanıcıya yukarıdan bakan değil, yanında yürüyen bir ekip arkadaşı gibi konuşursun. " +
              "Cevabı her zaman **" +
              langName +
              "** dilinde ver. " +
              "Format: dikey 9:16 (Reels / TikTok / Shorts). " +
              "Amacın: kullanıcının tek başına uygulayabileceği, net ve uygulanabilir fikirler üretmek.\n\n" +
              "Cevaplarını şu yapıda ver (ama başlıkları da cevabın diline göre çevir):\n" +
              "1) Kısa Özet (1–2 cümle, videonun ana fikri)\n" +
              "2) 3 Seçenekli Konsept:\n" +
              "   - Soft / Güvenli\n" +
              "   - Orta / Dengeli\n" +
              "   - Agresif / Cesur\n" +
              "   Her konsept için:\n" +
              "   • 1 cümle genel açıklama\n" +
              "   • 5–7 maddelik sahne kırılımı (HOOK + gelişme + kapanış)\n" +
              "3) Teknik Rehber:\n" +
              "   • Kamera açısı (telefonla nasıl tutulsun, tripod vs.)\n" +
              "   • Işık ayarı (evde, dışarıda, gece/gündüz)\n" +
              "   • Ses (mikrofon, ortam sesi, müzik)\n" +
              "   • Süre önerisi (örn: 15–35 sn)\n" +
              "   • Platforma özel küçük tüyolar (YouTube Shorts / TikTok / Reels farkları)\n" +
              "4) Ek Seçenekler:\n" +
              '   • Kullanıcıya \"İstersen bu fikirlerden biri için çekim planını sahne sahne anlatayım\" diye teklif et.\n' +
              "   • Eğer kullanıcı Pro ise ekstra olarak seri fikir / 30 günlük mini plan önerebileceğini hatırlat.\n\n" +
              "Boş, generic cümlelerden kaçın. Cümleler dolu ve net olsun. Gerçek bir içerik üreticisine konuşur gibi yaz.",
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
        max_tokens: 900,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI_RESPONSE_NOT_OK", data);
      // Kullanıcıya teknik detay yok, sadece genel mesaj
      return res.status(200).json({ message: GENERIC_FAIL });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      (langKey === "tr"
        ? "Herhangi bir içerik üretilmedi. Lütfen biraz sonra tekrar dene."
        : "No content was generated. Please try again shortly.");

    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("IDEAS_API_ERROR", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }
}
