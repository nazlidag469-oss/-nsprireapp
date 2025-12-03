// /api/admin-users.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY; // Vercel'deki SERVICE KEY

  if (!supabaseUrl || !serviceKey) {
    console.error("Supabase environment değişkenleri eksik.");
    return res
      .status(500)
      .json({ message: "Supabase environment eksik (URL veya SERVICE_KEY)." });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { data, error } = await supabase
      .from("inspire_users") // TABLO ADI BURADA
      .select("id, created_at, email, plan, credits, lang")
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
    console.error("admin-users API hata:", e);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
}
