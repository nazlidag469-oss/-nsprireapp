// pages/api/series.js
// 30 günlük içerik planı – uzun cevap, kesme yok
// OpenAI SDK YOK, direkt fetch ile çağırıyoruz.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang = "Turkish" } = req.body || {};

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "topic zorunludur." });
  }

  const langName = typeof lang === "string" ? lang : "Turkish";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "Sunucuda OPENAI_API_KEY tanımlı değil." });
  }

  const prompt = `
Sen deneyimli bir içerik stratejisisin.
Görevin: Kısa video üreten biri için **30 günlük detaylı içerik planı** yazmak.

Konu: "${topic}"
Dil: ${langName}

Kurallar:
- Her gün için "Gün X – Başlık" formatını kullan.
- Her günün altında en az 2–3 madde halinde yapılacakları yaz.
- Madde işaretleri için "- " kullan.
- Yazıyı kesinlikle ortasından kesme, 30. güne kadar TAMAMLAMADAN bırakma.
- Format düz metin olsun (Markdown başlıkları kullanabilirsin).

Lütfen tam 30 güne kadar detaylı plan üret.
`.trim();

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 2200, // uzun metin için yüksek sınır
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      console.error("OPENAI_SERIES_ERROR", data);
      const msg =
        data?.error?.message ||
        data?.message ||
        "OpenAI tarafında bir hata oluştu.";
      return res.status(500).json({ message: msg });
    }

    const text =
      data?.output?.[0]?.content?.[0]?.text ||
      data?.output_text ||
      "";

    if (!text || !text.trim()) {
      return res
        .status(500)
        .json({ message: "Modelden metin alınamadı (boş cevap)." });
    }

    // ÖNEMLİ: Burada hiçbir şekilde slice/substring YOK
    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("SERIES_API_UNEXPECTED_ERROR", e);
    return res.status(500).json({
      message: "30 günlük plan oluşturulurken beklenmeyen bir hata oluştu.",
    });
  }
}
