// /api/pro-silent.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : null;

// Dil kodunu normalize et (tr, en, de, es, ar)
function detectLangCode(lang) {
  const l = (lang || "").toLowerCase();
  if (l.startsWith("en")) return "en";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("ar")) return "ar";
  return "tr";
}

// PRO olmayan kullanıcıya gösterilecek mesaj (çok dilli)
function getProRequiredMessage(lang) {
  const code = detectLangCode(lang);

  switch (code) {
    case "en":
      return "This tool is only available for PRO users. Upgrade to PRO to unlock all features instantly.";
    case "es":
      return "Esta herramienta solo está disponible para usuarios PRO. Actualiza a PRO para desbloquear todas las funciones al instante.";
    case "de":
      return "Dieses Tool ist nur für PRO-Nutzer verfügbar. Wechsle zu PRO, um alle Funktionen sofort freizuschalten.";
    case "ar":
      return "هذه الأداة متاحة فقط لمستخدمي PRO. قم بالترقية إلى PRO لاستخدام جميع المزايا فورًا.";
    case "tr":
    default:
      return "Bu araç yalnızca PRO kullanıcılar için açıktır. Tüm özellikleri anında kullanmak için PRO’ya geç.";
  }
}

async function callAi(fullPrompt) {
  if (!openaiKey) {
    return "AI anahtarı (OPENAI_API_KEY) tanımlı değil. Lütfen Vercel Environment'a ekle.";
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are InspireApp PRO, expert at faceless / silent video strategies. Answer in clear Turkish.",
        },
        { role: "user", content: fullPrompt },
      ],
    }),
  });

  const json = await resp.json().catch(() => null);
  const text = json?.choices?.[0]?.message?.content?.trim();
  return text || "AI'den anlamlı bir cevap alınamadı.";
}

function buildPromptSilent(input, lang) {
  return `
Kullanıcı InspireApp PRO üyesi.

Görev: "Sessiz Video İçerik Üreticisi".

Konu / niş:
${input}

Lisan: ${lang}

Aşağıdaki paket şeklinde cevap ver:

1) Yüz göstermeden üretilebilecek 5 farklı sessiz video formatı (örnek: yazı kartları, b-roll + altyazı, ekran kaydı vs.).
2) Seçili konu için 10 adet "high retention" sessiz video akışı (1-2-3 adım şeklinde storyboard).
3) Kullanılabilecek arka plan video / stok görüntü temaları.
4) Sessiz videolar için 10 adet güçlü başlık (TikTok / Reels / Shorts).
5) İnsanları kaydetmeye ve paylaşmaya teşvik eden 5 CTA cümlesi.
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  if (!supabase) {
    return res.status(500).json({ message: "SUPABASE_CONFIG_MISSING" });
  }

  const { email, input, lang = "tr" } = req.body || {};

  if (!email || !input) {
    // Bu durumda bile anlamlı bir mesaj dönüyoruz ki UI'da çirkin sabit text görünmesin
    return res.status(400).json({ message: "EMAIL_AND_INPUT_REQUIRED" });
  }

  // 1) Kullanıcıyı Supabase'den çek
  let user;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, lang")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("pro-silent Supabase hatası:", error);
      return res.status(500).json({ message: "DB_ERROR" });
    }

    user = data || null;
  } catch (e) {
    console.error("pro-silent Supabase genel hata:", e);
    return res.status(500).json({ message: "DB_ERROR" });
  }

  const userLang = user?.lang || lang || "tr";

  // 2) PRO değilse → 200 OK + PRO mesajı
  if (!user || user.plan !== "pro") {
    const proMsg = getProRequiredMessage(userLang);

    return res.status(200).json({
      message: proMsg,
      proRequired: true,
    });
  }

  // 3) PRO ise → AI cevabı üret
  try {
    const prompt = buildPromptSilent(input, userLang);
    const text = await callAi(prompt);

    return res.status(200).json({
      message: text,
      proRequired: false,
    });
  } catch (e) {
    console.error("pro-silent AI hatası:", e);
    return res.status(500).json({ message: "AI_ERROR" });
  }
}
