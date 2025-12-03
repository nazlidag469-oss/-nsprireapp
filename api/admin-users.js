// /api/admin-users.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Hem GET hem POST kabul et -> debug için
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Sadece POST veya GET kullanılabilir." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY; // SERVICE ROLE KEY

  // 1) ENV kontrolü
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      message: "ENV_EKSİK",
      supabaseUrl_ok: !!supabaseUrl,
      serviceKey_ok: !!serviceKey,
      hint: "Vercel → Settings → Environment Variables → SUPABASE_URL + SUPABASE_SERVICE_KEY kontrol et, sonra redeploy."
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 2) Tabloyu oku
    const { data, error } = await supabase
      .from("inspire_users")   // Supabase’teki tablo adın
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Supabase’ten gelen gerçek hatayı olduğu gibi dönderiyoruz
      return res.status(500).json({
        message: "SUPABASE_HATA",
        code: error.code || null,
        details: error.details || null,
        hint: error.hint || null,
        error: error.message || String(error),
      });
    }

    // Admin panelinin beklediği format
    return res.status(200).json({ users: data || [] });

  } catch (e) {
    return res.status(500).json({
      message: "GENEL_HATA",
      error: String(e),
    });
  }
}
