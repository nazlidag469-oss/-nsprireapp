// api/admin-users.js
// Admin paneli için: Supabase'ten inspire_users tablosunu okur.
// Şifre kontrolü .env içindeki ADMIN_PANEL_PASSWORD ile yapılır.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST destekleniyor." });
  }

  const { password } = req.body || {};

  const adminPassword = process.env.ADMIN_PANEL_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!adminPassword || !supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      message:
        "Sunucu yapılandırması eksik. (ADMIN_PANEL_PASSWORD, SUPABASE_URL, SUPABASE_ANON_KEY ayarlanmalı.)",
    });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ message: "Admin şifresi hatalı." });
  }

  const url =
    supabaseUrl +
    "/rest/v1/inspire_users" +
    "?select=id,created_at,email,plan,lang,credits,ad_count,last_ad_date" +
    "&order=created_at.desc";

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        "Supabase isteğinde hata oluştu.";
      return res.status(r.status).json({ message: msg });
    }

    // Frontend'e sade bir JSON dönelim
    return res.status(200).json({
      users: Array.isArray(data) ? data : [],
    });
  } catch (e) {
    console.error("ADMIN_USERS_ERROR", e);
    return res
      .status(500)
      .json({ message: "Kullanıcı listesi alınırken beklenmeyen hata." });
  }
}
