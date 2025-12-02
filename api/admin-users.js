// api/admin-users.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase env eksik:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceKey,
  });
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  // Geçici olarak sadece POST kabul edelim
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // *** ÖNEMLİ ***
    // Burada HİÇBİR ŞİFRE KONTROLÜ YOK.
    // admin.html’den ne yazarsan yaz, direkt kullanıcı listesini dönecek.

    const { data, error } = await supabase
      .from('inspire_users')
      .select(
        'id, created_at, email, plan, lang, credits, ad_count, last_ad_date'
      )
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase kullanıcı listesi hatası:', error);
      return res.status(500).json({
        errorCode: 'ADMIN_USERS_DB_ERROR',
        message: 'Kullanıcı listesi alınamadı.',
      });
    }

    return res.status(200).json({ users: data || [] });
  } catch (err) {
    console.error('ADMIN_USERS_ERROR', err);
    return res.status(500).json({
      errorCode: 'ADMIN_USERS_ERROR',
      message: 'Beklenmeyen bir hata oluştu.',
    });
  }
}
