// /api/pro-competitor.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : null;

async function ensurePro(email) {
  if (!supabase) throw new Error("SUPABASE_CONFIG_MISSING");
  const { data, error } = await supabase
    .from("users")
    .select("plan")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data || data.plan !== "pro") {
    const e = new Error("ONLY_PRO");
    e.code = "ONLY_PRO";
    throw e;
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
            "You are InspireApp PRO, an expert at analyzing viral short videos. Answer in clear, structured Turkish.",
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

Girdi: 
${input}

Lisan: ${lang}

Aşağıdaki formatta ve Türkçe cevap ver:

1) Bu videonun / fikrin NEDEN tuttuğunu açıkla (algoritma, watch time, retention, psikoloji).
2) Aynı konuyu daha güçlü hale getiren 3 alternatif HOOK (ilk 3 saniye).
3) Kullanıcının kendi nişine göre yeniden yazılmış tam bir video fikri (hook + kısa script).
4) %100 kopya olmayan, türev bir trend önerisi (farklı açıdan ama benzer hissiyatlı).
5) Kısa "CTA" önerileri (takip et, kaydet, yorum yaztır).
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
  }

  const { email, input, lang = "Turkish" } = req.body || {};

  if (!email || !input) {
    return res.status(400).json({ message: "EMAIL_AND_INPUT_REQUIRED" });
  }

  try {
    await ensurePro(email);
  } catch (e) {
    if (e.code === "ONLY_PRO") {
      return res
        .status(403)
        .json({ message: "ONLY_PRO", detail: "Bu özellik sadece PRO üyeler için." });
    }
    console.error("pro-rival Supabase hatası:", e);
    return res.status(500).json({ message: "DB_ERROR" });
  }

  try {
    const prompt = buildPromptRival(input, lang);
    const text = await callAi(prompt);
    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("pro-rival AI hatası:", e);
    return res.status(500).json({ message: "AI_ERROR" });
  }
}
