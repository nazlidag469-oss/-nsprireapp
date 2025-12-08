// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik (register-user)!");
}

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
      .select("id, email, password, plan, credits, lang")
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

    // 2) Kullanıcı yoksa → KAYIT
    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            password, // basit şifre saklama; sonra hash geçebiliriz
            plan,
            credits,
            lang,
          },
        ])
        .select("id, email, plan, credits, lang")
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
        user: inserted,
      });
    }

    // 3) Kullanıcı VAR → şifre kontrol
    if (existing.password !== password) {
      return res.status(401).json({
        status: "error",
        message: "INVALID_PASSWORD",
      });
    }

    // 4) Login başarılı → plan/credits/lang güncelle (opsiyonel)
    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ plan, credits, lang })
      .eq("id", existing.id)
      .select("id, email, plan, credits, lang")
      .single();

    if (updateError) {
      console.error("Supabase UPDATE hatası (göz ardı):", updateError);
    }

    const userRow = updated || existing;

    return res.status(200).json({
      status: "login",
      message: "LOGIN_OK",
      user: userRow,
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
