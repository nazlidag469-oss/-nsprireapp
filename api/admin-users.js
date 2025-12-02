// /api/admin-users.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Environment değişkenleri eksik.");
    return res.status(500).json({ message: "Sunucu yapılandırma hatası." });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

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

  } catch (e) {
    console.error("API hata:", e);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
}
