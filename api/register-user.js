// api/register-user.js
// Vercel Node fonksiyonu – CommonJS sürüm

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Env doğru mu? Başta kontrol.
let supabase = null;
if (supabaseUrl && serviceKey) {
  supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", code: "METHOD_NOT_ALLOWED" });
  }

  // Env hiç yoksa: direkt hata
  if (!supabase) {
    return res.status(500).json({
      status: "error",
      code: "MISSING_ENV",
      error:
        "SUPABASE_URL veya SUPABASE_SERVICE_KEY environment değişkeni tanımlı değil.",
    });
  }

  const { email, password, plan = "free", credits = 4, lang = "tr" } =
    req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      code: "EMAIL_OR_PASSWORD_REQUIRED",
      error: "E-posta veya şifre eksik.",
    });
  }

  try {
    // 1) Instagram gibi: önce LOGIN dene
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (!signInError && signInData?.user) {
      // Kullanıcı zaten var → profil kaydını güncelle
      const { error: upsertErr } = await supabase
        .from("users")
        .upsert([{ email, plan, credits, lang }], { onConflict: "email" });

      if (upsertErr) {
        return res.status(500).json({
          status: "error",
          code: "UPSERT_ERROR",
          error: upsertErr.message,
        });
      }

      return res.status(200).json({
        status: "login",
        code: "LOGIN_OK",
      });
    }

    // 2) Login hatalı → signup dene
    const msg = (signInError?.message || "").toLowerCase();
    const isInvalidLogin =
      msg.includes("invalid") ||
      msg.includes("not found") ||
      msg.includes("invalid login credentials");

    if (isInvalidLogin) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        return res.status(500).json({
          status: "error",
          code: "SIGNUP_ERROR",
          error: signUpError.message,
        });
      }

      const { error: upsertErr } = await supabase
        .from("users")
        .upsert([{ email, plan, credits, lang }], { onConflict: "email" });

      if (upsertErr) {
        return res.status(500).json({
          status: "error",
          code: "UPSERT_ERROR",
          error: upsertErr.message,
        });
      }

      return res.status(200).json({
        status: "registered",
        code: "REGISTER_OK",
      });
    }

    // Buraya düşerse login ama invalid değil
    return res.status(500).json({
      status: "error",
      code: "AUTH_ERROR",
      error: signInError?.message || "UNKNOWN_AUTH_ERROR",
    });
  } catch (e) {
    console.error("register-user SERVER_ERROR:", e);
    return res.status(500).json({
      status: "error",
      code: "SERVER_ERROR",
      error: e.message || String(e),
    });
  }
};
