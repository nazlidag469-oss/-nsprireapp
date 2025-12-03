// /api/admin-users.js
// Amaç: Supabase AUTH tarafındaki tüm kullanıcıları listelemek (admin paneli için)

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
    // Supabase AUTH kullanıcılarını getir (tabloya bağlı değil)
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200, // İstersen artırabilirsin
    });

    if (error) {
      console.error("Supabase auth.admin.listUsers hatası:", error);
      return res.status(500).json({
        message: "Supabase kullanıcı listesi alınamadı.",
        detail: error.message || null,
      });
    }

    // Admin paneline sade bir liste dönelim
    const users =
      data?.users?.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        phone: u.phone,
      })) || [];

    return res.status(200).json({ users });
  } catch (e) {
    console.error("API genel hata:", e);
    return res.status(500).json({
      message: "Sunucu hatası oluştu.",
      detail: e.message || null,
    });
  }
}
