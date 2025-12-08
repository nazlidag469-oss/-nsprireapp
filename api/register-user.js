import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "METHOD_NOT_ALLOWED" });
  }

  const { email, password, plan = "free", credits = 4, lang = "tr" } =
    req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "EMAIL_OR_PASSWORD_REQUIRED" });
  }

  try {
    // 1) Önce LOGIN dene (Instagram tarzı)
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (!signInError && signInData?.user) {
      // Profil satırını da güncelle / oluştur
      await supabase
        .from("users")
        .upsert([{ email, plan, credits, lang }], { onConflict: "email" });

      return res.status(200).json({
        status: "login",
        message: "LOGIN_OK",
        user: signInData.user,
      });
    }

    // 2) Şifre yanlış vs. ise: yeni hesap açmayı dene
    const isInvalidLogin =
      signInError?.message &&
      signInError.message.toLowerCase().includes("invalid");

    if (isInvalidLogin) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        return res.status(500).json({
          status: "error",
          message: "SIGNUP_ERROR",
          error: signUpError.message,
        });
      }

      await supabase
        .from("users")
        .upsert([{ email, plan, credits, lang }], { onConflict: "email" });

      return res.status(200).json({
        status: "registered",
        message: "REGISTER_OK",
        user: signUpData.user,
      });
    }

    // Buraya düştüyse beklenmedik auth hatası var
    return res.status(500).json({
      status: "error",
      message: "AUTH_ERROR",
      error: signInError?.message || "UNKNOWN_AUTH_ERROR",
    });
  } catch (e) {
    console.error("register-user genel hata:", e);
    return res.status(500).json({
      status: "error",
      message: "SERVER_ERROR",
      error: e.message,
    });
  }
}
