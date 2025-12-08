// api/register-user.js  (Vercel Serverless Function)

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

  const { email, password, lang = "tr" } = req.body || {};

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

    let authStatus = "login";
    let authUser = signInData?.user || null;

    // Eğer şifre/geçersiz kullanıcı hatasıysa → yeni hesap oluştur
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

      authStatus = "registered";
      authUser = signUpData.user;
    } else if (signInError && !isInvalidLogin) {
      // Giriş denemesi başka bir sebepten patladıysa
      return res.status(500).json({
        status: "error",
        message: "AUTH_ERROR",
        error: signInError.message,
      });
    }

    if (!authUser) {
      return res.status(500).json({
        status: "error",
        message: "NO_USER",
      });
    }

    // 2) Kullanıcının profil satırını oku / oluştur
    let userRow = null;

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("users select error:", existingError);
    }

    if (existing) {
      userRow = existing;
      // sadece dili güncellemek istersen:
      if (lang && existing.lang !== lang) {
        const { data: updated, error: updateError } = await supabase
          .from("users")
          .update({ lang })
          .eq("email", email)
          .select()
          .single();
        if (!updateError && updated) userRow = updated;
      }
    } else {
      // İlk kez giriş yapan kullanıcı → free plan ile profil oluştur
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            plan: "free",
            credits: 4,
            lang,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("users insert error:", insertError);
      } else {
        userRow = inserted;
      }
    }

    return res.status(200).json({
      status: authStatus, // "login" veya "registered"
      message: authStatus === "login" ? "LOGIN_OK" : "REGISTER_OK",
      user: {
        id: authUser.id,
        email: authUser.email,
      },
      userData: userRow, // plan, credits, lang vs. burada
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
