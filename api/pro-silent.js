// /api/pro-silent.js
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
    console.error("pro-silent Supabase hatası:", e);
    return res.status(500).json({ message: "DB_ERROR" });
  }

  try {
    const prompt = buildPromptSilent(input, lang);
    const text = await callAi(prompt);
    return res.status(200).json({ message: text });
  } catch (e) {
    console.error("pro-silent AI hatası:", e);
    return res.status(500).json({ message: "AI_ERROR" });
  }
}
