// api/checkout.js
// Plan + ülkeye göre ödeme sağlayıcısının checkout linkini döndürür.
// Kart ekranı tamamen ödeme firmasının sitesinde açılır.

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { plan, country } = req.body || {};
  const c = country === "tr" ? "tr" : "other";

  let url = null;

  if (plan === "pro") {
    if (c === "tr") {
      // Türkiye için 299 TL fiyatlı Pro checkout linkini buraya koyacaksın
      url = process.env.PRO_TR_CHECKOUT_URL || null;
    } else {
      // Diğer ülkeler için 9.99 USD fiyatlı Pro checkout linki
      url = process.env.PRO_INTL_CHECKOUT_URL || null;
    }
  } else if (plan === "team") {
    // Takım planı için istersen benzer şekilde tanımla:
    if (c === "tr") {
      url = process.env.TEAM_TR_CHECKOUT_URL || null;
    } else {
      url = process.env.TEAM_INTL_CHECKOUT_URL || null;
    }
  } else if (plan === "free") {
    // Ücretsiz plan için özel bir sayfan varsa:
    url = process.env.FREE_CHECKOUT_URL || null;
  }

  if (!url) {
    return res
      .status(400)
      .json({ message: "Bu plan/ülke kombinasyonu için ödeme linki yok." });
  }

  return res.status(200).json({ url });
}
