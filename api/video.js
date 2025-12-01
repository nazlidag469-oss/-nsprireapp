// pages/api/video.js
// 15 saniyelik dikey (9:16) video üreten endpoint.
// Gerçek üretim için: Bir video AI servisine üye ol (Pika, Runway, OpenAI vs.)
// Sana verdiği API URL'yi VIDEO_API_URL, API KEY'i VIDEO_API_KEY olarak .env dosyana yaz.

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

  const { prompt, lang = "tr", platform = "tiktok" } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ message: "prompt zorunludur." });
  }

  const apiKey = process.env.VIDEO_API_KEY;
  const apiUrl = process.env.VIDEO_API_URL;
  if (!apiKey || !apiUrl) {
    return res.status(500).json({
      message:
        "Video servisi ayarlı değil. VIDEO_API_KEY ve VIDEO_API_URL .env içinde tanımlanmalı.",
    });
  }

  const langName = LANG_MAP[lang] || lang || "Turkish";

  const fullPrompt = `
InspireApp arayüzüne benzeyen, yüz kullanmadan, tamamen UI ve ikon animasyonlu,
dikey 9:16 formatında, yaklaşık 15 saniyelik bir kısa video üret.
Tema: ${prompt}

Kısıtlar:
- Gerçek insan yüzü veya kamera görüntüsü yok.
- Renk paleti: mor, lila, beyaz, gradient arka plan (#e9d5ff, #dbeafe).
- Ekranda INSPIREAPP logosu ve arayüz kartları, butonlar, sohbet balonları hareket etsin.
- "Hook Laboratuvarı", "Trend Kopya Makinesi", "30 Günlük Seri", "PRO" yazıları kısa kısa gözüksün.
- Platform: ${platform}
- Dil: ${langName}
- Tarz: modern, enerjik, uygulama tanıtım animasyonu, sessiz kullanılmaya uygun.

Output: mp4, 1080x1920, 15 saniye civarı.
`.trim();

  try {
    const r = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        duration_seconds: 15,
        aspect_ratio: "9:16",
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const msg =
        (data && (data.error || data.message)) ||
        "Video servisi hata döndürdü.";
      return res.status(r.status).json({ message: msg });
    }

    const videoUrl =
      (data && (data.video_url || data.url || data.output_url)) || null;

    if (!videoUrl) {
      return res
        .status(500)
        .json({ message: "Video URL alınamadı (servis cevabı eksik)." });
    }

    return res.status(200).json({
      message: "Video başarıyla üretildi.",
      url: videoUrl,
      filename: "inspireapp-short-15s.mp4",
    });
  } catch (e) {
    console.error("VIDEO_API_ERROR", e);
    return res.status(500).json({
      message: "Video üretimi sırasında beklenmeyen bir hata oluştu.",
    });
  }
}
