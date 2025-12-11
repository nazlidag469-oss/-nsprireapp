// api/pro-audience.js
// PRO Araç – Kitle İçgörü Analizi

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
      console.error("Supabase error (pro-audience):", error);
      return res.status(500).json({ message: "DB_ERROR" });
    }
    userRow = data || null;
  } catch (e) {
    console.error("Supabase exception (pro-audience):", e);
    return res.status(500).json({ message: "DB_EXCEPTION" });
  }

  if (!isProUser(userRow)) {
    return res.status(403).json({ message: "ONLY_PRO" });
  }

  let message = "";

  if (lang === "tr" || lang === "Turkish") {
    message =
      "👥 *Kitle İçgörü Analizi (PRO)*\n\n" +
      "HEDEF KİTLE TANIMI:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Bu kitlenin ana dertleri\n" +
      "• Zaman: “Kısa sürede sonuç görmek istiyorlar.”\n" +
      "• Enerji: “Uzun, sıkıcı videoları yarıda bırakıyorlar.”\n" +
      "• Güven: “Boş vaatlerden sıkılmış durumdalar.”\n\n" +
      "2) Video Format Tercihleri\n" +
      "• 15–35 saniyelik kısa videolar.\n" +
      "• Net başlık, net sonuç. Arada kaynamayan bilgi.\n" +
      "• Dik format, mobil ekrana uygun, büyük yazılar.\n\n" +
      "3) Onlara Uyan Hook Kalıpları\n" +
      "• “Eğer sen de [derdi] yaşıyorsan, bu video tam sana göre.”\n" +
      "• “Kimsenin söylemediği [niş konu] gerçeğini göstereyim.”\n" +
      "• “Şu 3 hatayı yapıyorsan, [sonuç] gelmemesi normal.”\n\n" +
      "4) CTA (Call to Action) Örnekleri\n" +
      "• “Bu tarz videoların devamı için ‘devam’ yaz.”\n" +
      "• “Bu bilgiyi kaybetmemek için videoyu kaydet.”\n" +
      "• “Bunu görmesi gereken bir arkadaşını etiketle.”\n\n" +
      "5) Senin İçin Mini İçerik Stratejisi\n" +
      "• Hafta içi (Pzt–Cum): Her gün 1 hızlı ipucu (15–20 sn).\n" +
      "• Hafta sonu: 1 story-telling video (30–45 sn) – başarı/başarısızlık hikâyesi.\n" +
      "• Ayda 1: “Bu ay neleri denedim?” formatında özet video.\n\n" +
      "İstersen bu kitlenin yaş aralığını, ülkesini ve kullandığı platformu daha net yaz; sana daha spesifik bir plan çıkarayım.";
  } else {
    message =
      "👥 PRO – Audience Insight Analysis\n\n" +
      "TARGET AUDIENCE DESCRIPTION:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Main pains / frustrations\n" +
      "• Time: they want quick wins and short videos.\n" +
      "• Energy: they drop long, slow videos.\n" +
      "• Trust: they are tired of fake promises and clickbait.\n\n" +
      "2) Preferred content format\n" +
      "• 15–35 second videos with one clear idea.\n" +
      "• Strong title + strong visual in the first 2–3 seconds.\n" +
      "• Vertical format, readable subtitles, fast cuts.\n\n" +
      "3) Hook patterns that fit them\n" +
      "• “If you also struggle with [pain], watch this.”\n" +
      "• “Let me show you the side of [topic] nobody talks about.”\n" +
      "• “If you’re doing these 3 mistakes, no wonder [result] never happens.”\n\n" +
      "4) CTA examples\n" +
      "• “Comment ‘more’ if you want part 2.”\n" +
      "• “Save this video so you don’t forget the steps.”\n" +
      "• “Send this to a friend who needs to hear it.”\n\n" +
      "You can refine age / location / main platform next time and we’ll build a deeper strategy around this audience.";
  }

  return res.status(200).json({ message });
};
