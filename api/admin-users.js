import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { password } = req.body;

    // ENV değişkenleri
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Env variables missing" });
    }

    // Admin şifresi eşleşmezse
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Tüm kullanıcıları çek
    const { data, error } = await supabase
      .from("inspire_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ users: data });

  } catch (error) {
    console.error("ADMIN_USERS_ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
