// api/admin-users.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const envPasswordRaw = process.env.ADMIN_PANEL_PASSWORD || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase env eksik:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceKey,
  });
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

function extractPassword(req) {
  const candidates = [];

  // Query string (GET / POST fark etmez)
  if (req.query) {
    candidates.push(
      req.query.password,
      req.query.pass,
      req.query.adminPassword,
      req.query.p
    );
  }

  // Body
  let body = req.body;

  if (typeof body === 'string') {
    if (body.trim().startsWith('{')) {
      try {
        const json = JSON.parse(body);
        candidates.push(
          json.password,
          json.pass,
          json.adminPassword,
          json.p
        );
      } catch (e) {
        // string’in kendisi de şifre olabilir
        candidates.push(body);
      }
    } else {
      // düz string ise direkt ekle
      candidates.push(body);
    }
  } else if (body && typeof body === 'object') {
    candidates.push(
      body.password,
      body.pass,
      body.adminPassword,
      body.p
    );
  }

  const found = candidates.find(
    (v) => typeof v === 'string' && v.trim().length > 0
  );

  return (found || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const envPassword = envPasswordRaw.trim();

    if (!envPassword) {
      console.error('ADMIN_PANEL_PASSWORD env değişkeni set edilmemiş');
      return res.status(500).json({
        errorCode: 'ADMIN_PASSWORD_NOT_SET',
        message: 'Admin şifresi ayarlı değil (env).',
      });
    }

    const inputPassword = extractPassword(req);

    console.log('ADMIN_LOGIN_ATTEMPT', {
      envLength: envPassword.length,
      inputLength: inputPassword.length,
      same: inputPassword === envPassword,
    });

    if (!inputPassword || inputPassword !== envPassword) {
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
