// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  const { email, plan, credits, lang } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "email zorunludur." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Environment değişkenleri eksik.");
    return res.status(500).json({ message: "Sunucu yapılandırma hatası." });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // email UNIQUE olduğu için aynı email tekrar gelirse update gibi davranacak
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          email,
          plan: plan || "free",
          credits:
            typeof credits === "number" && !Number.isNaN(credits)
              ? credits
              : null,
          lang: lang || "tr",
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Supabase upsert hatası:", error);
      return res.status(500).json({
        message: "Supabase upsert hatası.",
        detail: error.message,
      });
    }

    return res.status(200).json({ ok: true, user: data?.[0] || null });
  } catch (e) {
    console.error("REGISTER_USER_API_ERROR", e);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
}
