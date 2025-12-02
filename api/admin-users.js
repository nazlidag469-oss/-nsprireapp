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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔴 ÖNEMLİ KISIM: body string ise JSON.parse ile çözüyoruz
    let body = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body || '{}');
      } catch (e) {
        console.error('Body parse hatası:', e, 'raw body:', req.body);
        return res.status(400).json({
          errorCode: 'INVALID_JSON',
          message: 'Geçersiz istek gövdesi.',
        });
      }
    } else {
      body = req.body || {};
    }

    const rawPassword = body.password || '';

    const inputPassword = String(rawPassword).trim();
    const envPassword = String(process.env.ADMIN_PANEL_PASSWORD || '').trim();

    console.log('ADMIN_LOGIN_ATTEMPT', {
      hasEnvPassword: !!envPassword,
      envLength: envPassword.length,
      inputLength: inputPassword.length,
    });

    if (!envPassword) {
      console.error('ADMIN_PANEL_PASSWORD env değişkeni set edilmemiş');
      return res.status(500).json({
        errorCode: 'ADMIN_PASSWORD_NOT_SET',
        message: 'Admin şifresi ayarlı değil. Env ayarlarını kontrol et.',
      });
    }

    if (!inputPassword || inputPassword !== envPassword) {
      console.warn('ADMIN_INVALID_PASSWORD', {
        envLength: envPassword.length,
        inputLength: inputPassword.length,
      });
      return res.status(401).json({
        errorCode: 'ADMIN_INVALID_PASSWORD',
        message: 'Giriş başarısız. Şifre hatalı.',
      });
    }

    // ŞİFRE DOĞRU → kullanıcıları çek
    const { data, error } = await supabase
      .from('inspire_users')
      .select('id, created_at, email, plan, lang, credits, ad_count, last_ad_date')
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
