// api/pro-competitor.js
// PRO: Rakip video analizi

const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

function safeJsonBody(req) {
  try {
    if (typeof req.body === "string") {
      return JSON.parse(req.body || "{}");
    }
    return req.body || {};
  } catch {
    return {};
  }
}

async function ensureProUser(email) {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("users")
    .select("plan")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error("Supabase error (pro-competitor):", error);
    throw new Error("SUPABASE_ERROR");
  }
  const user = data && data[0];
  if (!user || user.plan !== "pro") {
    const err = new Error("ONLY_PRO");
    err.code = "ONLY_PRO";
    throw err;
  }
}

async function generateAnalysis(input, langName) {
  // Eğer OpenAI key yoksa, en azından dummy string dön.
  if (!openai) {
    return (
      `DEMO ÇIKTI (Sunucuda OPENAI_API_KEY tanımlı değil):\n\n` +
      `Gelen rakip video açıklaması/linki:\n${input}\n\n` +
      `Buraya gerçek yapay zekâ çıktısını ekleyebilirsin.`
    );
  }

  const system =
    "You are an expert short-form video strategist (TikTok, Reels, Shorts). " +
    "Analyze why the given competitor video works, extract hooks, structure, emotions, " +
    "and then rewrite a stronger version for the user's niche. Answer in " +
    langName +
    ".";

  const userPrompt =
    "Video açıklaması veya linki:\n\n" +
    input +
    "\n\n" +
    "1) Videonun neden tuttuğunu maddeler hâlinde açıkla.\n" +
    "2) Kullanılan hook ve duyguları çıkar.\n" +
    "3) Daha güçlü 3 adet alternatif hook yaz.\n" +
    "4) Aynı formatı kullanarak, ama birebir kopyalamadan, özgün bir senaryo yaz.";

  const resp = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
  });

  const out = resp.output?.[0]?.content?.[0]?.text;
  return out || "Yapay zekâdan anlamlı bir çıktı alınamadı.";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "METHOD_NOT_ALLOWED" });
    return;
  }

  const body = safeJsonBody(req);
  const email = (body.email || "").trim().toLowerCase();
  const input = (body.input || "").trim();
  const langName = body.lang || "Turkish";

  if (!email || !input) {
    return res.status(400).json({
      code: "EMAIL_AND_INPUT_REQUIRED",
      message:
        "Lütfen önce e-posta ile giriş yap ve kutuyu boş bırakma. (Rakip video analizi)",
    });
  }

  try {
    await ensureProUser(email);
  } catch (err) {
    if (err.code === "ONLY_PRO" || err.message === "ONLY_PRO") {
      return res.status(403).json({ code: "ONLY_PRO", message: "ONLY_PRO" });
    }
    console.error("ensureProUser error (pro-competitor):", err);
    return res.status(500).json({ message: "SERVER_ERROR" });
  }

  try {
    const text = await generateAnalysis(input, langName);
    return res.status(200).json({ message: text });
  } catch (err) {
    console.error("generateAnalysis error:", err);
    return res.status(500).json({ message: "AI_ERROR" });
  }
};
