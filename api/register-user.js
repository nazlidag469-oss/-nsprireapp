// pages/api/register-user.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.MY_SERVICE_KEY;

// Güvenlik için: ortam değişkenleri yoksa hemen hata dön
if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik!");
}

/**
 * Kullanıcı e-postasını, planını, kredilerini ve dili
 * Supabase'deki "users" tablosuna KAYDEDER.
 * 
 * email sütunu UNIQUE olduğu için:
 *  - İlk kayıt → insert
 *  - Sonraki kayıtlar → upsert (güncelle) olacak.
 */
export default async function handler(req, res) {
  // Sadece POST izni
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılır" });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { email, plan, credits, lang } = req.body || {};

  // Basit kontrol
  if (!email) {
    return res.status(400).json({ message: "EMAIL_REQUIRED" });
  }

  try {
    // email UNIQUE olduğu için upsert kullanıyoruz
    const { data, error } = await supabase
      .from("users")
      .upsert(
        [
          {
            email,
            plan: plan || "free",
            credits: typeof credits === "number" ? credits : 0,
            lang: lang || "tr",
          },
        ],
        { onConflict: "email" } // email zaten varsa, o satırı günceller
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase INSERT/UPSERT hatası:", error.message);
      return res.status(500).json({
        message: "INSERT_ERROR",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "OK",
      user: data,
    });
  } catch (err) {
    console.error("Beklenmeyen API hatası:", err);
    return res.status(500).json({
      message: "UNEXPECTED_ERROR",
      error: String(err),
    });
  }
}
