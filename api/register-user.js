// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik (register-user)!");
}

// Yeni kayıtlarda kullanılacak varsayılanlar
const DEFAULT_PLAN = "free";
const DEFAULT_CREDITS = 4;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "METHOD_NOT_ALLOWED" });
  }

  const { email, password, lang = "tr" } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "EMAIL_AND_PASSWORD_REQUIRED",
    });
  }

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      status: "error",
      message: "SUPABASE_CONFIG_MISSING",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 1) Bu email var mı?
    const { data: existing, error: selectError } = await supabase
      .from("users")
      .select('id, email, "Password", plan, credits, lang')
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Supabase SELECT hatası:", selectError);
      return res.status(500).json({
        status: "error",
        message: "DB_SELECT_ERROR",
        error: selectError.message,
      });
    }

    // 2) Kullanıcı yoksa → KAYIT (her zaman FREE)
    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            Password: password, // sütun adı büyük P
            plan: DEFAULT_PLAN,
            credits: DEFAULT_CREDITS,
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
          plan: inserted.plan || DEFAULT_PLAN,
          credits:
            typeof inserted.credits === "number"
              ? inserted.credits
              : DEFAULT_CREDITS,
          lang: inserted.lang || lang,
        },
      });
    }

    // 3) Kullanıcı VAR → Şifre kontrol
    const storedPassword = existing.Password;
    if (storedPassword !== password) {
      return res.status(401).json({
        status: "error",
        code: "INVALID_PASSWORD", // app.js bu kodu bekliyor
        message: "INVALID_PASSWORD",
      });
    }

    // 4) Login başarılı
    // plan & credits Supabase'te ne ise ÖYLE kalır (pro/free).
    let finalUser = existing;

    // Sadece dil değişmişse lang güncelle
    if (existing.lang !== lang) {
      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({ lang })
        .eq("id", existing.id)
        .select('id, email, "Password", plan, credits, lang')
        .single();

      if (!updateError && updated) {
        finalUser = updated;
      } else if (updateError) {
        console.error("Supabase UPDATE lang hatası (göz ardı):", updateError);
      }
    }

    return res.status(200).json({
      status: "login",
      message: "LOGIN_OK",
      user: {
        id: finalUser.id,
        email: finalUser.email,
        plan: finalUser.plan || DEFAULT_PLAN,
        credits:
          typeof finalUser.credits === "number"
            ? finalUser.credits
            : DEFAULT_CREDITS,
        lang: finalUser.lang || lang,
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
