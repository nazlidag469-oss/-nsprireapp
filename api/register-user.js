import { createClient } from "@supabase/supabase-js";

// Supabase client'ı dosyanın üstünde 1 kere oluştur
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // BURASI ÖNEMLİ: MY_SERVICE_KEY DEĞİL
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılır" });
  }

  const { email, plan, credits, lang } = req.body;

  // Güvenlik: email yoksa kayıt yapma
  if (!email) {
    return res.status(400).json({ message: "EMAIL_REQUIRED" });
  }

  // Aynı e-mail varsa hata fırlatmasın diye upsert da kullanabilirsin,
  // ama şimdilik insert kalsın, Unique constraint zaten Supabase tarafında.
  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      plan,
      credits,
      lang,
      last_ad_date: null,
      ad_count: 0,
    })
    .select();

  if (error) {
    return res.status(500).json({
      message: "INSERT_ERROR",
      error: error.message,
    });
  }

  return res.status(200).json({
    message: "OK",
    user: data[0],
  });
}
