// pages/api/copy.js
// Trend Kopya Makinesi – link/konudan yola çıkarak kopya ama özgün senaryo üretir

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang } = req.body || {};
  const t = (topic || "").toString().trim() || "Belirsiz trend";
  const langName = (lang || "Turkish").toString();

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.json({
      message:
        `🎬 Trend Kopya (${t}):\n` +
        "Bu trendi birebir kopyalamadan, aynı enerjide farklı bir video çekmek için:\n" +
        "1) Açılışta trendin en çarpıcı anını kendi tarzında yeniden kur.\n" +
        "2) Orta bölümde kendi deneyimini / fikrini ekle.\n" +
        "3) Finalde izleyiciden yorum/takip iste.\n",
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
              "Sen TikTok/Reels/Shorts trendlerini yeniden uyarlayan bir içerik danışmanısın. " +
              "Cevabı **" +
              langName +
              "** dilinde ver. " +
              "Amaç: trendi birebir kopyalamadan, aynı enerji ve formatta daha kaliteli ve sana ait bir video fikri çıkarmak.\n\n" +
              "Çıktıyı şu yapıda ver (başlıkları çevir):\n" +
              "1) Trendin ruhunu çözümle (varsayımsal analiz – neden izleniyor?)\n" +
              "2) Senin versiyonun:\n" +
              "   - Hook cümlesi\n" +
              "   - 5–6 maddelik sahne planı (9:16 dikey, telefonla çekilebilir)\n" +
              "   - Kullanmaya uygun efekt / müzik / altyazı önerileri\n" +
              "3) Kopya riskini azaltmak için küçük değişiklikler (mekan, açı, cümle tarzı vs.)\n" +
              "4) Ek teklif: \"İstersen bu trendi 3 farklı nişe uyarlayabilirim (örn. eğitim, komedi, motivasyon)\" şeklinde bir kapanış cümlesi ekle.",
          },
          {
            role: "user",
            content:
              `Trend linki veya açıklaması: ${t}\n` +
              "Video formatı: dikey 9:16, kısa video.",
          },
        ],
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || "OpenAI isteğinde hata oluştu.";
      return res.status(500).json({ message: msg });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      "Herhangi bir kopya öneri üretilemedi.";

    return res.status(200).json({ message: text });
  } catch (e) {
    return res.status(500).json({
      message:
        "Trend kopya önerisi üretilirken beklenmeyen hata oluştu.",
    });
  }
}
