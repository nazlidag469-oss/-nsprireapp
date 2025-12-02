// pages/api/series.js
// OpenAI YOK – Tamamen yerel, 30 günlük planı JS ile üretiyor.

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { topic, lang = "Turkish" } = req.body || {};
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ message: "topic zorunludur." });
  }

  const cleanTopic = topic.trim();
  const langName = typeof lang === "string" ? lang : "Turkish";

  // Basit, ama TAM 30 günlük düz metin üretelim
  let text = `📅 30 Günlük İçerik Planı\nKonu: ${cleanTopic}\nDil: ${langName}\n\n`;

  for (let day = 1; day <= 30; day++) {
    text += `Gün ${day} – ${cleanTopic} için içerik fikri ${day}\n`;
    text += `- Giriş: İzleyicinin dikkatini çekecek kısa bir soru veya iddialı cümle yaz.\n`;
    text += `- Gelişme: ${cleanTopic} ile ilgili 1–2 pratik ipucu veya mini hikâye anlat.\n`;
    text += `- Kapanış: Takip, yorum veya kayıt olmaya teşvik eden net bir çağrı ekle.\n`;
    text += `- Ek: İstersen o güne özel bir hashtag veya küçük bir meydan okuma (challenge) öner.\n\n`;
  }

  // FRONTEND beklediği format: { message: "..." }
  return res.status(200).json({ message: text });
}
