// pages/api/ideas.js
// Kısa video içerik koçu – YouTube / TikTok / Instagram verileriyle desteklenmiş fikir üretimi

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { prompt, platform, lang, mode, format } = req.body || {};
  const topic = (prompt || "").toString().trim() || "Belirsiz konu";
  const langName = (lang || "Turkish").toString();
  const platformSafe = (platform || "youtube").toString();

  // --- ENV ---
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res
      .status(500)
      .json({ message: "OPENAI_API_KEY tanımlı değil (server side)." });
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
        // Burada gerçekten trending endpoint'i yerine kullanıcının eski search koduna benzer bir örnek var.
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
        JSON.stringify(d).slice(0, 800) +
        "\n";
    } catch (e) {
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
              "   • Kullanıcıya \"İstersen bu fikirlerden biri için çekim planını sahne sahne anlatayım\" diye teklif et.\n" +
              "   • Eğer kullanıcı Pro ise ekstra olarak seri fikir / 30 günlük mini plan önerebileceğini hatırlat.\n\n" +
              "Boş, generic cümlelerden kaçın. Cümleler dolu ve net olsun. Gerçek bir içerik üreticisine konuşur gibi yaz.",
          },
          {
            role: "user",
            content:
              `Konu: ${topic}\n` +
              `Platform: ${platformSafe}\n` +
              `İstenen format: ${format || "dikey 9:16 kısa video"}\n` +
              `Ek bağlam:\n${extraContext}`,
          },
        ],
        max_tokens: 900,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || "OpenAI isteğinde hata oluştu.";
      return res.status(500).json({ message: msg });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      "Herhangi bir içerik üretilmedi.";

    return res.status(200).json({ message: text });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "OpenAI isteği sırasında beklenmeyen hata oluştu." });
  }
            }
