// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik (register-user)!");
}

// ★ PLAY TEST İÇİN ÖZEL PRO HESAP
// Bu mail + şifre ile giriş yapan kullanıcı, her zaman PRO döner.
// Google Play "Uygulama erişimi" ekranında da bu bilgiyi vereceksin.
const TEST_PRO_EMAIL = "nazlidag469@gmail.com";
const TEST_PRO_PASSWORD = "123456";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "METHOD_NOT_ALLOWED" });
  }

  const { email, password, plan = "free", credits = 4, lang = "tr" } =
    req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "EMAIL_AND_PASSWORD_REQUIRED",
    });
  }

  // ★ 1) ÖNCE ÖZEL PRO TEST HESABINI KONTROL ET
  if (email === TEST_PRO_EMAIL && password === TEST_PRO_PASSWORD) {
    // Supabase'e bile gitmiyoruz, direkt PRO login döndürüyoruz.
    return res.status(200).json({
      status: "login",
      message: "LOGIN_OK_TEST_PRO",
      user: {
        id: "test-pro-user",
        email: TEST_PRO_EMAIL,
        plan: "pro",
        credits: 999, // İstersen 4 yap, ben bol bıraktım
        lang,
      },
    });
  }

  // ★ 2) Diğer tüm kullanıcılar için normal Supabase akışı
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      status: "error",
      message: "SUPABASE_CONFIG_MISSING",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 2.1) Bu email var mı? (Password sütunu büyük P ile!)
    const { data: existing, error: selectError } = await supabase
      .from("users")
      .select('id, email, "Password", plan, credits, lang')
      .eq("email", email)
      .maybeSingle(); // 0 satırsa data = null

    if (selectError) {
      console.error("Supabase SELECT hatası:", selectError);
      return res.status(500).json({
        status: "error",
        message: "DB_SELECT_ERROR",
        error: selectError.message,
      });
    }

    // 2.2) Kullanıcı yoksa → KAYIT OLUŞTUR
    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            // Tablo sütunu büyük P: "Password"
            Password: password,
            plan,
            credits,
            lang,
          },
        ])
        .select('id, email, "Password", plan, credits, lang')
        .single();

      if (insertError) {
        console.error("Supabase INSERT hatası:", insertError);
        return res.status(500).json({
          status: "error",
          message: "DB_INSERT_ERROR",
          error: insertError.message,
        });
      }

      return res.status(200).json({
        status: "registered",
        message: "REGISTER_OK",
        user: {
          id: inserted.id,
          email: inserted.email,
          plan: inserted.plan || plan,
          credits: inserted.credits ?? credits,
          lang: inserted.lang || lang,
        },
      });
    }

    // 2.3) Kullanıcı VAR → şifre kontrol
    const storedPassword = existing.Password; // büyük P

    if (storedPassword !== password) {
      return res.status(401).json({
        status: "error",
        message: "INVALID_PASSWORD",
      });
    }

    // 2.4) Login başarılı → plan/credits/lang güncelle (opsiyonel)
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ plan, credits, lang })
      .eq("id", existing.id)
      .select('id, email, "Password", plan, credits, lang')
      .single();

    if (updateError) {
      console.error("Supabase UPDATE hatası (göz ardı):", updateError);
    }

    const userRow = updated || existing;

    return res.status(200).json({
      status: "login",
      message: "LOGIN_OK",
      user: {
        id: userRow.id,
        email: userRow.email,
        plan: userRow.plan || plan,
        credits: userRow.credits ?? credits,
        lang: userRow.lang || lang,
      },
    });
  } catch (err) {
    console.error("register-user genel hata:", err);
    return res.status(500).json({
      status: "error",
      message: "SERVER_ERROR",
      error: String(err),
    });
  }
}
