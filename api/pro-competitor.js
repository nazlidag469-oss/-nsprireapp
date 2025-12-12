// api/pro-competitor.js
// PRO Araç – Rakip Video Analizi
// Gereken env:
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

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
  if (userRow.Plan === "pro") return true; // Büyük harfli kolon için
  if (userRow.is_pro === true) return true; // bool alan varsa
  return false;
}

module.exports = async function handler(req, res) {
  // Kullanıcıya teknik hata göstermeyeceğimiz genel mesaj
  const GENERIC_FAIL = "Şu an yanıt üretilemedi, lütfen tekrar dene.";

  // Kullanıcıya temiz, “hata gibi görünmeyen” yönlendirmeler
  const NEED_LOGIN =
    "Bu PRO aracı için giriş yapman gerekiyor. (E-posta ile giriş yaptıktan sonra tekrar dene.)";
  const ONLY_PRO_TEXT =
    "Bu araç yalnızca PRO üyeler içindir. PRO’ya geçerek kullanabilirsin.";

  if (req.method !== "POST") {
    // Teknik kod yerine temiz mesaj
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  if (!supabase) {
    // Eskiden teknik env mesajı gidiyordu, artık gizliyoruz
    console.error(
      "PRO_COMPETITOR_SUPABASE_ENV_MISSING: SUPABASE_URL / SUPABASE_SERVICE_KEY"
    );
    return res.status(200).json({ message: GENERIC_FAIL });
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

  // Eskiden INPUT_REQUIRED dönüyordu; artık temiz mesaj
  if (!input) {
    const msg =
      lang === "tr" || lang === "Turkish"
        ? "Lütfen rakip video linki veya açıklaması yaz."
        : "Please paste the competitor video link or description.";
    return res.status(200).json({ message: msg });
  }

  // Frontend şu an email göndermiyor olabilir: o yüzden “EMAIL_REQUIRED” gibi kod göstermiyoruz.
  if (!email) {
    return res.status(200).json({ message: NEED_LOGIN });
  }

  // 1) Kullanıcıyı bul
  let userRow = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, Plan, is_pro")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error (pro-competitor):", error);
      return res.status(200).json({ message: GENERIC_FAIL });
    }
    userRow = data || null;
  } catch (e) {
    console.error("Supabase exception (pro-competitor):", e);
    return res.status(200).json({ message: GENERIC_FAIL });
  }

  // 2) PRO kontrol
  if (!isProUser(userRow)) {
    return res.status(200).json({ message: ONLY_PRO_TEXT });
  }

  // 3) Cevap üret (LLM yok, test için ideal)
  let message = "";

  if (lang === "tr" || lang === "Turkish") {
    message =
      "🎯 *Rakip Video Analizi (PRO)*\n\n" +
      "GÖNDERİLEN VİDEO / AÇIKLAMA:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Neden İzleniyor / Tuttu?\n" +
      "• Başlangıçta net bir problem veya merak uyandırma var.\n" +
      "• Video süresi kısa ve tempo yüksek tutulmuş.\n" +
      "• Hikâye akışı sade: giriş – problem – küçük sır / çözüm.\n" +
      "• Görsel ritim (cut, zoom, yazı efektleri) dikkat dağıtmadan ilerliyor.\n\n" +
      "2) Hook’u Daha Güçlü Yapmak İçin Öneriler\n" +
      "• İlk 2 saniyede direkt *büyük vaadi* söyle: “Bunu bilmeden video çekme.”\n" +
      "• Rakip videonun en güçlü cümlesini daha kavgacı / merak uyandırıcı hâle getir.\n" +
      "• Ekranda yazı (caption) ile ses senkronu yap; ilk cümlede büyük font kullan.\n\n" +
      "3) Senin Nişine Göre Özel Versiyon\n" +
      "Aşağıdaki kalıbı kendi nişine göre uygulayabilirsin:\n\n" +
      "• Açılış (0–3 sn): “Bugün sana _kimsenin anlatmadığı_ bir şey göstereceğim: [senin konu].”\n" +
      "• Orta kısım (3–15 sn): 2–3 tane kısa madde: önce problem, sonra mini çözüm.\n" +
      "• Kapanış (15–30 sn): “Eğer bunu beğendiysen, ikincisini istiyorsan ‘devam’ yaz.”\n\n" +
      "4) Aynı Fikrin %100 Sana Özel Hook Örnekleri\n" +
      "• “Bu videodan sonra [hedef kitlen] gibi rezil olmazsın.”\n" +
      "• “Şu hatayı yapıyorsan, videolarının tutmaması normal.”\n" +
      "• “33 saniyede sana [konu] ile ilgili kimsenin göstermediği taktiği göstereceğim.”\n\n" +
      "İstersen bir sonraki adımda rakip videonun *tam metnini* yaz, senin için daha detaylı kopya + senaryolaştırma yapalım.";
  } else {
    message =
      "🎯 PRO – Competitor Video Analysis\n\n" +
      "INPUT VIDEO / DESCRIPTION:\n" +
      "---------------------------------\n" +
      input +
      "\n\n" +
      "1) Why it performs well\n" +
      "• Strong problem / curiosity in the first seconds.\n" +
      "• Short runtime, high tempo, very little dead time.\n" +
      "• Clear structure: hook – problem – insight / secret – call to action.\n\n" +
      "2) How to make the hook stronger\n" +
      "• State the main promise in the first 2 seconds.\n" +
      "• Turn the strongest sentence of the competitor into a more polarizing / curiosity-driving version.\n" +
      "• Sync on-screen text with voice and use big bold text at second 1–2.\n\n" +
      "3) A generic template for your niche\n" +
      "• Hook (0–3s): “Let me show you a [topic] trick nobody talks about.”\n" +
      "• Body (3–15s): 2–3 bullets: first the pain, then the quick fix.\n" +
      "• Close (15–30s): “If you want part 2, comment ‘more’ and I’ll drop it.”\n\n" +
      "You can paste the full transcript of the competitor video next time so we can rewrite it 1:1 for your style.";
  }

  return res.status(200).json({ message });
};
