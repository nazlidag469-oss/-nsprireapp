// /api/admin-users.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Sadece POST kullanılabilir." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("ADMIN_USERS: Environment değişkenleri eksik.");
    return res
      .status(500)
      .json({ message: "Sunucu yapılandırma hatası (env eksik)." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    const { data, error } = await supabase
      .from("users")        // tablo adın farklıysa BURAYI değiştir
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN_USERS Supabase sorgu hatası:", error);
      return res.status(500).json({
        message: "Supabase sorgu hatası.",
        detail: error.message || null,
      });
    }

    return res.status(200).json({ users: data || [] });
  } catch (e) {
    console.error("ADMIN_USERS BEKLENMEYEN HATA:", e);
    return res
      .status(500)
      .json({ message: "Sunucu hatası oluştu (admin-users)." });
  }
}
