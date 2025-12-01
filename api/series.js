// pages/api/series.js
// 30 günlük kısa video içerik planı

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang } = req.body || {};
  const t = (topic || "").toString().trim() || "Belirsiz konu";

  const langName =
    LANG_MAP[lang] || // "tr" vs
    (lang || "").toString() || // "Turkish" vs
    "Turkish";

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    // Fallback: basit statik cevap
    return res.json({
      message:
        `📅 30 Günlük Plan (${t}):\n` +
        "- 1. Gün: Tanıtım\n- 2. Gün: Hikâye\n...\n- 30. Gün: Final",
    });
  }

  try {
    const response = await fetch(
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
              content:
                "Sen kısa video üreticileri için 30 günlük içerik takvimi hazırlayan bir içerik stratejistisin. " +
                "Cevabı **" +
                langName +
                "** dilinde ver. " +
                "Plan tamamen dikey (9:16) Reels / TikTok / Shorts formatı için tasarlanmalı.\n\n" +
                "Her gün için şu yapıyı kullan:\n" +
                "Gün X – Kısa başlık\n" +
                "- Hook cümlesi\n" +
                "- Video fikri (1–2 cümle)\n" +
                "- Mini call-to-action (yorum, takip, kaydet gibi)\n\n" +
                "Günleri 1'den 30'a kadar sırayla yaz, tablo yerine düz metin kullan.",
            },
            {
              role: "user",
              content: `Konu: ${t}\nFormat: 9:16 kısa video planı`,
            },
          ],
          max_tokens: 900,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || "OpenAI isteğinde hata oluştu.";
      return res.status(500).json({ message: msg });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      "Herhangi bir plan üretilemedi.";

    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("SERIES_API_ERROR", e);
    return res.status(500).json({
      message: "30 günlük plan üretilirken beklenmeyen hata oluştu.",
    });
  }
}
