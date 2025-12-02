// /api/admin-users.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  // --- 1) Admin Şifre Kontrolü ---
  const { password } = req.body || {};
  const adminPass = process.env.ADMIN_PANEL_PASSWORD;

  if (!password || password !== adminPass) {
    return res.status(401).json({ message: "Yetkisiz erişim. Şifre yanlış." });
  }

  // --- 2) Supabase Bağlantısı (ANON KEY KULLANILACAK) ---
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({
      message: "Supabase ortam değişkenleri eksik.",
    });
  }

  const supabase = createClient(supabaseUrl, anonKey);

  // --- 3) Tabloyu oku ---
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase sorgu hatası:", error);
      return res.status(500).json({
        message: "Supabase sorgu hatası.",
        detail: error.message,
      });
    }

    return res.status(200).json({ users: data || [] });

  } catch (err) {
    console.error("API hata:", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
}
