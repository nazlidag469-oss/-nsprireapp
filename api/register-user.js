// /api/register-user.js
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Supabase env değişkenleri eksik (register-user)!");
}

const DEFAULT_PLAN = "free";
const DEFAULT_CREDITS = 4;

// Supabase client'i dışarıda tutmak daha stabil (serverless warm-start)
const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

function normalizeEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s === "null" || s === "undefined" || s === "none") return "";
  return s;
}

function isValidEmail(email) {
  // basit ama yeterli kontrol
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a), "utf8");
  const bb = Buffer.from(String(b), "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

// Format: scrypt$<salt_b64>$<hash_b64>
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function verifyPassword(stored, password) {
  const s = String(stored || "");

  // ✅ Yeni format
  if (s.startsWith("scrypt$")) {
    const parts = s.split("$");
    if (parts.length !== 3) return { ok: false, legacy: false };

    const salt = Buffer.from(parts[1], "base64");
    const hashExpected = Buffer.from(parts[2], "base64");
    const hashNow = crypto.scryptSync(password, salt, 64);

    if (hashNow.length !== hashExpected.length)
      return { ok: false, legacy: false };

    return {
      ok: crypto.timingSafeEqual(hashNow, hashExpected),
      legacy: false,
    };
  }

  // ✅ Eski sistem (düz şifre) – GERİYE DÖNÜK UYUMLULUK
  // doğruysa girişe izin ver, sonra migrate edeceğiz
  return { ok: safeEqual(s, String(password)), legacy: true };
}

export default async function handler(req, res) {
  // Cache kaynaklı saçmalıkları engelle
  res.setHeader("Cache-Control", "no-store");

  // CORS/preflight (bazı hostlarda lazım)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "METHOD_NOT_ALLOWED" });
  }

  if (!supabase) {
    return res
      .status(500)
      .json({ status: "error", message: "SUPABASE_CONFIG_MISSING" });
  }

  // Body parse (string gelebilir)
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || "").trim();
  const lang = body.lang || "tr";

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "EMAIL_AND_PASSWORD_REQUIRED",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: "error",
      message: "INVALID_EMAIL_FORMAT",
    });
  }

  try {
    // 1) Bu email var mı? (case-insensitive)
    const { data: existingArr, error: selectError } = await supabase
      .from("users")
      .select('id, email, "Password", plan, credits, lang')
      .ilike("email", email)
      .limit(1);

    if (selectError) {
      console.error("Supabase SELECT hatası:", selectError);
      return res.status(500).json({
        status: "error",
        message: "DB_SELECT_ERROR",
      });
    }

    const existing =
      Array.isArray(existingArr) && existingArr.length ? existingArr[0] : null;

    // 2) Kullanıcı yoksa → KAYIT (her zaman FREE)
    if (!existing) {
      const hashed = hashPassword(password);

      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            Password: hashed, // ✅ artık hash
            plan: DEFAULT_PLAN,
            credits: DEFAULT_CREDITS,
            lang,
          },
        ])
        .select('id, email, plan, credits, lang')
        .single();

      if (insertError) {
        console.error("Supabase INSERT hatası:", insertError);
        return res.status(500).json({
          status: "error",
          message: "DB_INSERT_ERROR",
        });
      }

      return res.status(200).json({
        status: "registered",
        message: "REGISTER_OK",
        user: {
          id: inserted.id,
          email: inserted.email,
          plan: inserted.plan || DEFAULT_PLAN,
          credits:
            typeof inserted.credits === "number"
              ? inserted.credits
              : DEFAULT_CREDITS,
          lang: inserted.lang || lang,
        },
      });
    }

    // 3) Kullanıcı VAR → Şifre kontrol (hash + legacy destek)
    const storedPassword = existing.Password;
    const v = verifyPassword(storedPassword, password);

    if (!v.ok) {
      // app.js şu koşula bakıyordu: res.status===401 && data.message==="INVALID_PASSWORD"
      return res.status(401).json({
        status: "error",
        message: "INVALID_PASSWORD",
      });
    }

    // ✅ Legacy ise migrate (düz şifreyi hash'e çevir)
    if (v.legacy) {
      const hashed = hashPassword(password);
      const { error: migErr } = await supabase
        .from("users")
        .update({ Password: hashed })
        .eq("id", existing.id);

      if (migErr) {
        console.error("Password migrate error (göz ardı edilebilir):", migErr);
      }
    }

    // 4) Login başarılı – dil değiştiyse güncelle
    let finalUser = existing;

    if (existing.lang !== lang) {
      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({ lang })
        .eq("id", existing.id)
        .select('id, email, plan, credits, lang')
        .single();

      if (!updateError && updated) {
        finalUser = { ...finalUser, ...updated };
      } else if (updateError) {
        console.error("Supabase UPDATE lang hatası (göz ardı):", updateError);
      }
    }

    return res.status(200).json({
      status: "login",
      message: "LOGIN_OK",
      user: {
        id: finalUser.id,
        email: finalUser.email,
        plan: finalUser.plan || DEFAULT_PLAN,
        credits:
          typeof finalUser.credits === "number"
            ? finalUser.credits
            : DEFAULT_CREDITS,
        lang: finalUser.lang || lang,
      },
    });
  } catch (err) {
    console.error("register-user genel hata:", err);
    return res.status(500).json({
      status: "error",
      message: "SERVER_ERROR",
    });
  }
}
