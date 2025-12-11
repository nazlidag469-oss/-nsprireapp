// /api/pro-competitor.js
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
      return "This competitor analysis tool is only available for PRO users. Upgrade to PRO to unlock detailed breakdowns instantly.";
    case "es":
      return "Esta herramienta de análisis de competidores solo está disponible para usuarios PRO. Actualiza a PRO para desbloquear análisis detallados al instante.";
    case "de":
      return "Dieses Konkurrenzanalyse-Tool ist nur für PRO-Nutzer verfügbar. Wechsle zu PRO, um sofort detaillierte Analysen freizuschalten.";
    case "ar":
      return "أداة تحليل المنافسين هذه متاحة فقط لمستخدمي PRO. قم بالترقية إلى PRO للحصول على تحليلات مفصلة فورًا.";
    case "tr":
    default:
      return "Bu rakip video analiz aracı sadece PRO kullanıcılar için açıktır. Detaylı analizleri anında görmek için PRO’ya geç.";
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
            "You are InspireApp PRO, an expert at analyzing viral short videos. Answer in clear, structured language.",
        },
        { role: "user", content: fullPrompt },
      ],
    }),
  });

  const json = await resp.json().catch(() => null);
  const text = json?.choices?.[0]?.message?.content?.trim();
  return text || "AI'den anlamlı bir cevap alınamadı.";
}

function buildPromptRival(input, lang) {
  return `
Kullanıcı InspireApp PRO üyesi.

Görev: "Rakip Video Analizi" özelliği.

Rakip video / fikir girdisi: 
${input}

Lisan: ${lang}

Aşağıdaki formatta ve mümkün olduğunca bu dilde cevap ver:

1) Bu videonun / fikrin NEDEN tuttuğunu açıkla (algoritma, watch time, retention, psikoloji).
2) Aynı konuyu daha güçlü hale getiren 3 alternatif HOOK (ilk 3 saniye).
3) Kullanıcının kendi nişine göre yeniden yazılmış tam bir video fikri (hook + kısa script).
4) %100 kopya olmayan, türev bir trend önerisi (farklı açıdan ama benzer hissiyatlı).
5) Kısa "CTA" önerileri (takip et, kaydet, yorum yazdır).
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

  // 1) Kullanıcıyı Supabase'den çek
  let user;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, plan, lang")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("pro-competitor Supabase hatası:", error);
      return res.status(500).json({ message: "DB_ERROR" });
    }

    user = data || null;
  } catch (e) {
    console.error("pro-competitor Supabase genel hata:", e);
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

  // 3) PRO ise → AI ile gerçek analiz üret
  try {
    const prompt = buildPromptRival(input, userLang);
    const text = await callAi(prompt);

    return res.status(200).json({
      message: text,
      proRequired: false,
    });
  } catch (e) {
    console.error("pro-competitor AI hatası:", e);
    return res.status(500).json({ message: "AI_ERROR" });
  }
}
