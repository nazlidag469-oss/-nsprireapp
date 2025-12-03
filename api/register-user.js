// /api/register-user.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Sadece POST kabul ediyoruz
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılabilir." });
  }

  // ENV değişkenleri
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY; // SERVICE ROLE KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      message: "ENV_EKSIK",
      supabaseUrl_ok: !!supabaseUrl,
      serviceKey_ok: !!serviceKey,
      hint: "Vercel → Settings → Environment Variables → SUPABASE_URL + SUPABASE_SERVICE_KEY ekle."
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email eksik." });
    }

    // Kullanıcı var mı kontrol et
    const { data: existing, error: selError } = await supabase
      .from("inspire_users")
      .select("*")
      .eq("email", email)
      .single();

    if (selError && selError.code !== "PGRST116") {
      return res.status(500).json({
        message: "SELECT_HATASI",
        error: selError
      });
    }

    // Eğer kullanıcı varsa → güncelle
    if (existing) {
      const { data, error } = await supabase
        .from("inspire_users")
        .update({
          updated_at: new Date()
        })
        .eq("email", email)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          message: "UPDATE_HATASI",
          error
        });
      }

      return res.status(200).json({
        ok: true,
        type: "updated",
        user: data
      });
    }

    // Yeni kullanıcı oluştur
    const { data, error } = await supabase
      .from("inspire_users")
      .insert({
        email,
        plan: "free",
        credits: 4,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "INSERT_HATASI",
        error
      });
    }

    return res.status(200).json({
      ok: true,
      type: "created",
      user: data
    });

  } catch (e) {
    return res.status(500).json({
      message: "GENEL_HATA",
      error: String(e)
    });
  }
}
