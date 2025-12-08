// pages/api/register-user.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Sadece POST kullanılır" });

  const { email, password, plan = "free", credits = 4, lang = "tr" } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "EMAIL_OR_PASSWORD_REQUIRED" });

  // Supabase Auth ile kayıt ol
  const { data: authData, error: authError } =
    await supabase.auth.signUp({ email, password });

  if (authError)
    return res.status(500).json({ message: "AUTH_ERROR", error: authError.message });

  // Users tablosuna profil kaydı oluştur
  const { data, error } = await supabase
    .from("users")
    .upsert([{ email, plan, credits, lang }], { onConflict: "email" })
    .select()
    .single();

  if (error)
    return res.status(500).json({ message: "DB_ERROR", error: error.message });

  return res.status(200).json({ message: "OK", user: data });
}
