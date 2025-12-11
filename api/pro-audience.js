// /api/pro-audience.js
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
      return "This audience insight tool is only available for PRO users. Upgrade to PRO to unlock detailed psychology and content strategies.";
    case "es":
      return "Esta herramienta de análisis de audiencia solo está disponible para usuarios PRO. Actualiza a PRO para desbloquear estrategias detalladas de psicología y contenido.";
    case "de":
      return "Dieses Tool zur Zielgruppenanalyse ist nur für PRO-Nutzer verfügbar. Wechsle zu PRO, um detaillierte Psychologie- und Content-Strategien freizuschalten.";
    case "ar":
      return "أداة تحليل الجمهور هذه متاحة فقط لمستخدمي PRO. قم بالترقية إلى PRO للحصول على استراتيجيات مفصلة لعلم النفس والمحتوى.";
    case "tr":
    default:
      return "Bu kitle içgörü analizi aracı sadece PRO kullanıcılar için açıktır. Detaylı psikoloji ve içerik stratejilerini görmek için PRO’ya geç.";
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
            "You are InspireApp PRO, an expert on audience psychology and short-form content. Answer in the requested language, clearly and in structured bullet-points.",
        },
        { role: "user", content: fullPrompt },
      ],
    }),
  });

  const json = await resp.json().catch(() => null);
  const text = json?.choices?.[0]?.message?.content?.trim();
  return text || "AI'den anlamlı bir cevap alınamadı.";
}

function buildPromptAudience(input, lang) {
  return `
Kullanıcı InspireApp PRO üyesi.

Görev: "Kitle İçgörü Analizi (AI Persona Builder)".

Kullanıcının verdiği hedef kitle tanımı:
${input}

Lisan: ${lang}

Aşağıdaki başlıklara göre, net ve maddeli cevap ver:

1) Bu kitlenin temel psikolojik tetikleyicileri (madde madde).
2) Bu kitlenin en sevdiği kısa video formatları (örneklerle).
3) Bu kitleye özel 10 güçlü HOOK cümlesi.
4) En iyi çalışacak CTA kalıpları (yorum, kaydet, takip, link tıklama).
5) Yapılmaması gereken 5 hata (bu kitleye içerik üretirken).
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
    return res.status(400).json({ message: "EMAIL_AND_INPUT_REQUIRED" });
  }

  // 1) Kullanıcıyı Supabase'ten çek
  let user;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, lang")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("pro-audience Supabase hatası:", error);
      return res.status(500).json({ message: "DB_ERROR" });
    }

    user = data || null;
  } catch (e) {
    console.error("pro-audience Supabase genel hata:", e);
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

  // 3) PRO ise → AI ile gerçek kitle analizi üret
  try {
    const prompt = buildPromptAudience(input, userLang);
    const text = await callAi(prompt);

    return res.status(200).json({
      message: text,
      proRequired: false,
    });
  } catch (e) {
    console.error("pro-audience AI hatası:", e);
    return res.status(500).json({ message: "AI_ERROR" });
  }
}
