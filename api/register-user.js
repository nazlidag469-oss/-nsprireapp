// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik (register-user)!");
}

// ★ PLAY TEST İÇİN ÖZEL PRO HESAP
// Bu mail + şifre ile giriş yapan kullanıcı, her zaman PRO döner.
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

  // ------------------------------------------------
  // 1) ÖZEL PRO TEST HESABI
  // ------------------------------------------------
  if (email === TEST_PRO_EMAIL && password === TEST_PRO_PASSWORD) {
    if (!supabaseUrl || !serviceKey) {
      // Env yoksa bile, en azından app'e PRO dönelim
      return res.status(200).json({
        status: "login",
        message: "LOGIN_OK_TEST_PRO_NO_DB",
        user: {
          id: "test-pro-user",
          email: TEST_PRO_EMAIL,
          plan: "pro",
          credits: 999,
          lang,
        },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Supabase'de bu kullanıcıyı PRO olarak upsert et
    try {
      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            email: TEST_PRO_EMAIL,
            Password: TEST_PRO_PASSWORD,
            plan: "pro",
            credits: 999,
            lang,
          },
          { onConflict: "email" }
        )
        .select('id, email, "Password", plan, credits, lang')
        .single();

      if (error) {
        console.error("Supabase UPSERT hatası (test pro):", error);
      }

      return res.status(200).json({
        status: "login",
        message: "LOGIN_OK_TEST_PRO",
        user: {
          id: data?.id || "test-pro-user",
          email: TEST_PRO_EMAIL,
          plan: "pro",
          credits: data?.credits ?? 999,
          lang: data?.lang || lang,
        },
      });
    } catch (err) {
      console.error("Test PRO upsert genel hata:", err);
      return res.status(200).json({
        status: "login",
        message: "LOGIN_OK_TEST_PRO_FALLBACK",
        user: {
          id: "test-pro-user",
          email: TEST_PRO_EMAIL,
          plan: "pro",
          credits: 999,
          lang,
        },
      });
    }
  }

  // ------------------------------------------------
  // 2) DİĞER TÜM KULLANICILAR – NORMAL AKIŞ
  // ------------------------------------------------
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      status: "error",
      message: "SUPABASE_CONFIG_MISSING",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 2.1) Bu email var mı?
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

    // 2.2) Kullanıcı yoksa → KAYIT
    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            Password: password, // sütun adı büyük P
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

    // 2.3) Kullanıcı VAR → Şifre kontrol
    const storedPassword = existing.Password;

    if (storedPassword !== password) {
      return res.status(401).json({
        status: "error",
        message: "INVALID_PASSWORD",
      });
    }

    // 2.4) Login başarılı → mevcut plan'ı KORU
    const newPlan = existing.plan || plan || "free";
    const newCredits =
      existing.credits !== null && existing.credits !== undefined
        ? existing.credits
        : credits ?? 4;
    const newLang = existing.lang || lang || "tr";

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update({ plan: newPlan, credits: newCredits, lang: newLang })
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
        plan: userRow.plan || newPlan,
        credits: userRow.credits ?? newCredits,
        lang: userRow.lang || newLang,
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
