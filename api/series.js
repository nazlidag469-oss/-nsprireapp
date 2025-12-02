// pages/api/series.js
// 30 günlük içerik planı – UZUN METİN, KESME YOK

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 2200, // UZUN METİN İÇİN YÜKSEK SINIR
    });

    // Yeni Responses API: metni böyle alıyoruz
    const output = response.output[0]?.content[0]?.text || "";

    if (!output) {
      return res
        .status(500)
        .json({ message: "Modelden metin alınamadı (boş cevap)." });
    }

    // 👇 ÖNEMLİ: BURADA ARTIK slice/substring YOK, HİÇ KESMİYORUZ
    return res.status(200).json({ message: output });
  } catch (e) {
    console.error("SERIES_API_ERROR", e);
    return res
      .status(500)
      .json({ message: "30 günlük plan oluşturulurken bir hata oluştu." });
  }
}
