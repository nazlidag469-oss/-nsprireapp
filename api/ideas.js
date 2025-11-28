// api/ideas.js
// YouTube + TikTok + Instagram verisini (opsiyonel) kullanarak
// OpenAI'den NET cevap + kısa video fikirleri üretir.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { prompt, platform, lang } = req.body || {};
  const topic = prompt || "Belirsiz konu";
  const langName = lang || "Turkish";

  // 1) ENV ANAHTARLARI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res
      .status(500)
      .json({ message: "OPENAI_API_KEY tanımlı değil (server side)." });
  }

  const youtubeKey = process.env.YOUTUBE_API_KEY;
  const rapidKey = process.env.RAPIDAPI_KEY;

  let extraContext = "";

  // 2) YouTube (isteğe bağlı)
  if (platform === "youtube" && youtubeKey) {
    try {
      const url =
        "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=" +
        encodeURIComponent(topic) +
        "&type=video&key=" +
        youtubeKey;

      const r = await fetch(url);
      const d = await r.json();
      const titles =
        d.items?.map((v) => v.snippet?.title).filter(Boolean) || [];

      if (titles.length) {
        extraContext +=
          "\nYouTube'da benzer başlıklar:\n- " +
          titles.slice(0, 5).join("\n- ") +
          "\n";
      }
    } catch (e) {
      // YouTube hatası olursa sessiz geç
    }
  }

  // 3) TikTok / Instagram - RapidAPI (isteğe bağlı)
  if ((platform === "tiktok" || platform === "instagram") && rapidKey) {
    try {
      let url = "";
      let headers = {
        "x-rapidapi-key": rapidKey,
      };
      let method = "GET";
      let body = undefined;

      if (platform === "tiktok") {
        url =
          "https://tiktok-api23.p.rapidapi.com/api/search/account?keyword=" +
          encodeURIComponent(topic) +
          "&cursor=0&search_id=0";
        headers["x-rapidapi-host"] = "tiktok-api23.p.rapidapi.com";
      } else if (platform === "instagram") {
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
        platform.toUpperCase() +
        " API örnek verisi:\n" +
        JSON.stringify(d).slice(0, 800) +
        "\n";
    } catch (e) {
      // RapidAPI hatası olursa da sessiz geç
    }
  }

  // 4) OpenAI ile içerik üret (NET cevap + 5 fikir)
  try {
    const PLATFORM_LABELS = {
      youtube: "YouTube Shorts",
      tiktok: "TikTok",
      instagram: "Instagram Reels",
    };
    const platformLabel = PLATFORM_LABELS[platform] || "kısa video";

    const systemPrompt = `
Sen InspireApp adlı bir kısa video içerik koçusun.
Kullanıcı hangi dili seçmişse cevabın TAMAMINI o dilde yazacaksın: ${langName}.

Her istekte şu sırayı izle:
1) Önce kullanıcının sorusunu veya isteğini doğrudan ve NET bir şekilde açıkla (3–6 cümle).
2) Sonra aynı konuda ${platformLabel} için 5 kısa video fikri üret.
3) Fikirleri numaralı liste olarak ver (1., 2., 3. ...).
4) Her fikir en fazla 2–3 cümle olsun; lafı uzatma, pratik ve uygulanabilir öneriler ver.
5) Aşağıda sana verilen YouTube/TikTok/Instagram bağlamını kullan ama konu dışına ASLA çıkma.
`;

    const userPrompt = `
Kullanıcının mesajı / konusu:
"${topic}"

Seçilen platform: ${platformLabel}
Cevap dili: ${langName}

Ek bağlam (YouTube / RapidAPI verisi olabilir, yoksa boş olabilir):
${extraContext}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // istersen burada modeli değiştirebilirsin
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    const dataText = await response.text();
    let data;

    try {
      data = JSON.parse(dataText);
    } catch (e) {
      // JSON parse edemediysek ham metni dön
      return res.status(200).json({
        message: dataText || "OpenAI'dan beklenmeyen bir cevap geldi.",
      });
    }

    if (!response.ok) {
      const msg =
        data?.error?.message ||
        "OpenAI isteğinde hata oluştu. Kota veya faturalandırma ayarlarını kontrol edin.";
      return res.status(response.status).json({ message: msg });
    }

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      "Herhangi bir içerik üretilmedi.";

    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("OpenAI error:", e);
    return res
      .status(500)
      .json({ message: "OpenAI isteği sırasında beklenmeyen hata oluştu." });
  }
      }
