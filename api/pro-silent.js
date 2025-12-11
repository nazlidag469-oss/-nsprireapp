// api/pro-silent.js
// PRO Araç – Sessiz Video İçerik Üreticisi

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && serviceKey) {
  supabase = createClient(supabaseUrl, serviceKey);
}

function isProUser(userRow) {
  if (!userRow) return false;
  if (userRow.plan === "pro") return true;
  if (userRow.Plan === "pro") return true;
  if (userRow.is_pro === true) return true;
  return false;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  if (!supabase) {
    return res.status(500).json({
      message: "Supabase env değişkenleri eksik (SUPABASE_URL / SUPABASE_SERVICE_KEY).",
    });
  }

  let body = {};
  try {
    body = req.body || {};
  } catch {
    body = {};
  }

  const email = (body.email || "").toLowerCase().trim();
  const input = (body.input || "").trim();
  const lang = body.lang || "Turkish";

  if (!email) {
    return res.status(400).json({ message: "EMAIL_REQUIRED" });
  }
  if (!input) {
    return res.status(400).json({ message: "INPUT_REQUIRED" });
  }

  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error (pro-silent):", error);
      return res.status(500).json({ message: "DB_ERROR" });
    }
    userRow = data || null;
  } catch (e) {
    console.error("Supabase exception (pro-silent):", e);
    return res.status(500).json({ message: "DB_EXCEPTION" });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({ message: "ONLY_PRO" });
  }

  let message = "";

  if (lang === "tr" || lang === "Turkish") {
    message =
      "🤫 *Sessiz Video İçerik Üreticisi (PRO)*\n\n" +
      "KONU / NİŞ:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Sessiz Video Tipi\n" +
      "• Sadece yazı + arka plan görüntüleri.\n" +
      "• Bazen emoji, ok, highlight efektleri.\n" +
      "• Tümü altyazı mantığında, ses kullanmadan.\n\n" +
      "2) Sahne Akışı (örnek 20–25 sn)\n" +
      "• 0–2 sn  : Büyük başlık – “Bunu kimse sana göstermiyor: [konu].”\n" +
      "• 2–6 sn  : Madde 1 – kısa cümle + ilgili görsel.\n" +
      "• 6–10 sn : Madde 2 – kısa cümle + görsel / ekran kaydı.\n" +
      "• 10–15 sn: Madde 3 – sonuç veya minik sır.\n" +
      "• 15–25 sn: Özet + CTA yazısı (kayıt et / takip et).\n\n" +
      "3) Metin Tarzı Önerileri\n" +
      "• Kısa, tek satırlı cümleler; her sahnede 1 fikir.\n" +
      "• KELİMELERİN BİR KISMINI BÜYÜK YAZ – vurgu için.\n" +
      "• Renkli kutular: “HATA”, “DOĞRU”, “GİZLİ TAKTİK” gibi.\n\n" +
      "4) Senin Konuna Özel 3 Sessiz Video Fikri\n" +
      "FİKİR 1 – “3 Adımda [konu]”\n" +
      "• Sahne 1: Başlık – “3 adımda [konu] çözüldü.”\n" +
      "• Sahne 2–4: Her adım için 1 cümle.\n" +
      "• Sahne 5: “Kayıt et, sonra dene.”\n\n" +
      "FİKİR 2 – “Öncesi / Sonrası”\n" +
      "• Sahne 1: “ÖNCE: [kötü durum]”\n" +
      "• Sahne 2: “SONRA: [iyi durum]”\n" +
      "• Sahne 3–4: Ne değişti? Kısa maddeler.\n\n" +
      "FİKİR 3 – “Yapma / Yap”\n" +
      "• Sahne 1: “BUNU YAPMA:”\n" +
      "• Sahne 2: 2–3 kelimelik kötü alışkanlık.\n" +
      "• Sahne 3: “BUNU YAP:”\n" +
      "• Sahne 4: 2–3 kelimelik doğru davranış.\n\n" +
      "İstersen bir sonraki adımda, bu fikri hangi platformda (TikTok, Reels, Shorts) kullanacağını yaz; sana süre ve formatı daha net optimize edeyim.";
  } else {
    message =
      "🤫 PRO – Silent Video Content Generator\n\n" +
      "TOPIC / NICHE:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Silent video style\n" +
      "• Only text + background footage.\n" +
      "• Emojis, arrows, highlights for attention.\n" +
      "• 100% understandable without sound.\n\n" +
      "2) Example flow (20–25 seconds)\n" +
      "• 0–2s   : Big headline – “Nobody shows you this about [topic].”\n" +
      "• 2–6s   : Point 1 – 1 short sentence + visual.\n" +
      "• 6–10s  : Point 2 – 1 short sentence + visual.\n" +
      "• 10–15s : Point 3 – small secret or key insight.\n" +
      "• 15–25s : Summary text + CTA (save / follow).\n\n" +
      "3) Text style suggestions\n" +
      "• Very short lines, one idea per scene.\n" +
      "• Use CAPS for emphasis on key words.\n" +
      "• Use labels like “MISTAKE”, “FIX”, “SECRET”.\n\n" +
      "You can send a more detailed description of your niche next time (age, platform, language) and we’ll turn it into a full silent-video content calendar.";
  }

  return res.status(200).json({ message });
};
