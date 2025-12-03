// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY; // SERVICE ROLE KEY olmalı

  if (!supabaseUrl || !serviceKey) {
    console.error("Supabase environment değişkenleri eksik.");
    return res
      .status(500)
      .json({ message: "Supabase environment eksik (URL veya SERVICE_KEY)." });
  }

  const { email, plan, credits, lang } = req.body || {};
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(400).json({ message: "Email zorunlu." });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { error } = await supabase.from("inspire_users").insert([
      {
        email: cleanEmail,
        plan: plan || "free",
        credits: typeof credits === "number" ? credits : 0,
        lang: lang || "tr",
      },
    ]);

    if (error) {
      console.error("Supabase insert hatası:", error);
      return res.status(500).json({
        message: "Supabase insert hatası.",
        detail: error.message,
      });
    }

    return res.status(200).json({ message: "OK" });
  } catch (e) {
    console.error("register-user API hata:", e);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
}
