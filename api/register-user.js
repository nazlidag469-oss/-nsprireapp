// pages/api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Güvenlik kontrolü
if (!supabaseUrl || !serviceKey) {
  console.error("Supabase environment değişkenleri eksik!");
}

/**
 * Kullanıcı e-postasını + şifresini + plan / kredi / dil bilgisini
 * Supabase'deki "users" tablosuna KAYDEDER (email UNIQUE).
 *
 * NOT: Supabase'de "users" tablosunda şu kolonların olduğundan emin ol:
 *  - email (text, UNIQUE)
 *  - password (text)
 *  - plan (text)
 *  - credits (integer)
 *  - lang (text)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılır" });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { email, password, plan, credits, lang } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "EMAIL_REQUIRED" });
  }
  if (!password) {
    return res.status(400).json({ message: "PASSWORD_REQUIRED" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        [
          {
            email,
            password, // Şimdilik düz text; ileride hash'e çevirebiliriz.
            plan: plan || "free",
            credits: Number.isInteger(credits) ? credits : 0,
            lang: lang || "tr",
          },
        ],
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase UPSERT hatası:", error.message);
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
