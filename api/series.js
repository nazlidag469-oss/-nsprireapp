// pages/api/series.js
// OpenAI kullanarak 30 günlük, HER GÜN FARKLI içerik planı üretir.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang = "Turkish" } = req.body || {};

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "topic zorunludur." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      message: "OpenAI yapılandırılmamış. OPENAI_API_KEY .env dosyanda tanımlı olmalı.",
    });
  }

  const cleanTopic = topic.trim();
  const langName = typeof lang === "string" ? lang : "Turkish";

  // OpenAI'den İSTEĞİMİZ:
  // - 30 gün
  // - Her gün için FARKLI fikir
  // - Kısa tut (token sınırına takılmasın)
  // - DÜZ METİN, Markdown yok
  const systemPrompt = `
Sen kısa video ve içerik üreticileri için
uzman bir içerik planlayıcısısın.

Görevin: Verilen konu için 30 günlük içerik takvimi hazırlamak.
Her günün fikri birbirinden anlamlı şekilde farklı olmalı.
Aynı cümleleri, aynı şablonu tekrar etme.

Cevap DİLİ: ${langName}.
Markdown başlıkları kullanma, sadece düz metin yaz.
Her günü şu formatta yaz:

Gün 1 – Kısa başlık
- Satır 1 (giriş)
- Satır 2 (gelişme veya fikir)
- Satır 3 (kapanış / çağrı)

Sonra alt satıra geç ve "Gün 2 – ..." diye devam et.
Toplam 30 gün yaz.
`.trim();

  const userPrompt = `
Konu: ${cleanTopic}

Bu konu üzerine 30 günlük içerik planı istiyorum.
Platform: Kısa video formatları (YouTube Shorts, TikTok, Reels) düşünerek yaz.
Her gün tek bir video fikrini anlatsın, gereksiz uzun açıklamalardan kaçın.
`.trim();

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // erişimin olan başka bir model varsa ismini burada değiştirebilirsin
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1800, // çok uzun olmadan 30 günü sığdırmak için
        temperature: 0.8,
      }),
    });

    const data = await openaiRes.json().catch(() => null);

    if (!openaiRes.ok) {
      const msg =
        (data && (data.error?.message || data.message)) ||
        "OpenAI isteği başarısız oldu.";
      console.error("OPENAI_SERIES_ERROR", msg, data);
      return res.status(500).json({ message: msg });
    }

    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Modelden içerik alınamadı.";

    // Frontend callSimpleAPI() sadece { message } bekliyor
    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("OPENAI_SERIES_EXCEPTION", e);
    return res.status(500).json({
      message: "30 günlük plan üretilirken beklenmeyen bir hata oluştu.",
    });
  }
}
