// api/trends.js
// YouTube "mostPopular" ile haftanın trend videolarını döner.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Sadece GET destekleniyor." });
  }

  const youtubeKey = process.env.YOUTUBE_API_KEY;
  if (!youtubeKey) {
    return res
      .status(500)
      .json({ message: "YOUTUBE_API_KEY tanımlı değil (server side)." });
  }

  // ?region=TR gibi query parametresi, yoksa varsayılan US
  const region = (req.query.region || "US").toString().toUpperCase();

  try {
    const url =
      "https://www.googleapis.com/youtube/v3/videos" +
      "?part=snippet,contentDetails,statistics" +
      "&chart=mostPopular" +
      "&maxResults=5" +
      "&regionCode=" +
      encodeURIComponent(region) +
      "&key=" +
      youtubeKey;

    const r = await fetch(url);
    const d = await r.json();

    if (!r.ok) {
      const msg =
        d?.error?.message || "YouTube trend isteğinde hata oluştu.";
      return res.status(r.status).json({ message: msg });
    }

    const items =
      d.items?.map((v) => ({
        id: v.id,
        title: v.snippet?.title || "Başlıksız video",
        url: "https://www.youtube.com/watch?v=" + v.id,
      })) || [];

    return res.status(200).json({ items });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "YouTube trend isteği sırasında beklenmeyen hata." });
  }
}
