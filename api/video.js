// /api/video.js
// 15 sn'lik dikey video üretmek üzere Replicate gibi bir servise bağlanmaya hazır endpoint.
// Gerçek video için: REPLICATE_API_TOKEN ve REPLICATE_MODEL_VERSION ortam değişkenlerini eklemen gerekiyor.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ message: "prompt gerekli." });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_MODEL_VERSION; // Pika model versiyon ID'si

  if (!token || !version) {
    return res.status(500).json({
      message:
        "Video servisi ayarlı değil. Vercel'de REPLICATE_API_TOKEN ve REPLICATE_MODEL_VERSION environment variable eklemen gerekiyor.",
    });
  }

  try {
    // 1) Prediction oluştur
    const createResp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version,
        input: {
          prompt,
          // 15 sn ~ 360 frame @24fps (model limitlerine göre azaltman gerekebilir)
          num_frames: 360,
          fps: 24,
          aspect_ratio: "9:16",
        },
      }),
    });

    const prediction = await createResp.json();

    if (!createResp.ok) {
      return res.status(createResp.status).json({
        message:
          prediction?.error || "Video isteği oluşturulurken hata oluştu.",
      });
    }

    // 2) Sonuç bitene kadar kısa bir süre poll et
    let status = prediction.status;
    let result = prediction;
    const start = Date.now();

    while (status === "starting" || status === "processing") {
      if (Date.now() - start > 55000) {
        // Vercel zaman aşımı sınırı
        return res
          .status(504)
          .json({ message: "Video üretimi zaman aşımına uğradı." });
      }

      await new Promise((r) => setTimeout(r, 3000));

      const checkResp = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      result = await checkResp.json();
      status = result.status;
    }

    if (status !== "succeeded") {
      return res.status(500).json({
        message:
          result?.error || "Video üretimi tamamlanamadı, lütfen tekrar dene.",
      });
    }

    const out = result.output;
    const videoUrl = Array.isArray(out) ? out[0] : out;

    if (!videoUrl) {
      return res.status(500).json({ message: "Video URL bulunamadı." });
    }

    return res.status(200).json({ videoUrl });
  } catch (e) {
    console.error("Video API hatası:", e);
    return res.status(500).json({ message: "Video üretirken hata oluştu." });
  }
        }
