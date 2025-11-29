// pages/api/hook.js
// Hook Laboratuvarı – güçlü açılış cümleleri üretir

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang } = req.body || {};
  const t = (topic || "").toString().trim() || "Belirsiz konu";
  const langName = (lang || "Turkish").toString();

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.json({
      message:
        `⚡ Hook Laboratuvarı (${t}):\n` +
        "- Soft: “Bu videoda X hakkında sakin sakin konuşacağız...”\n" +
        "- Orta: “X hakkında kimsenin söylemediği şeyi anlatıyorum...”\n" +
        "- Agresif: “X hakkında bildiğin her şeyi unut, 15 saniyede göstereyim.”",
    });
  }

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
              "Sen kısa video açılış cümleleri (hook) konusunda uzman bir metin yazarsın. " +
              "Cevabı **" +
              langName +
              "** dilinde ver. " +
              "Tüm hook'lar dikey Reels/TikTok/Shorts için tasarlanmış olmalı. " +
              "Hook'lar çok uzun olmamalı (en fazla 1–2 cümle), ama vurucu olmalı.\n\n" +
              "Çıktıyı şu yapıda ver (başlıkları da cevabın diline göre çevir):\n" +
              "1) Soft / Güvenli Hook'lar (4–5 adet)\n" +
              "2) Orta / Dengeli Hook'lar (4–5 adet)\n" +
              "3) Agresif / Cesur Hook'lar (4–5 adet)\n" +
              "Her maddeyi numaralı liste yap.\n" +
              "Sonunda kullanıcıya \"İstersen bu hook'lardan biri için tam senaryo yazabilirim\" diye teklif et.",
          },
          {
            role: "user",
            content: `Hook üretilecek konu: ${t}`,
          },
        ],
        max_tokens: 700,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || "OpenAI isteğinde hata oluştu.";
      return res.status(500).json({ message: msg });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      "Herhangi bir hook üretilemedi.";

    return res.status(200).json({ message: text });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Hook üretimi sırasında beklenmeyen hata oluştu." });
  }
}
