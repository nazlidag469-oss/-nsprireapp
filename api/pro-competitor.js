// pages/api/pro-competitor.js
// PRO: Rakip Video Analizi (detaylı + hızlı + AbortError fix)

const DEFAULT_TIMEOUT_MS = 32000; // ✅ AbortError fix
const DEFAULT_MAX_TOKENS = 650;   // ✅ daha hızlı cevap
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function cleanInput(x) {
  return String(x || "").trim();
}

async function supabaseGetUserByEmail(email) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-side only

  if (!url || !key) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const r = await fetch(`${url}/rest/v1/users?select=email,plan,is_pro&email=eq.${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  const d = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = d?.message || d?.error || `SUPABASE_HTTP_${r.status}`;
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }

  const user = Array.isArray(d) ? d[0] : null;
  return user || null;
}

async function fetchOpenAIChat({ messages, timeoutMs = DEFAULT_TIMEOUT_MS, maxTokens = DEFAULT_MAX_TOKENS }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        max_tokens: maxTokens,
        messages,
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const msg = data?.error?.message || `OPENAI_HTTP_${r.status}`;
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }

    const text =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    return String(text || "").trim();
  } finally {
    clearTimeout(id);
  }
}

function buildMessages({ input, lang }) {
  // input: kullanıcı yazdığı şey (link/açıklama/başlık vs)
  // lang: "Turkish" / "English" vs (sen backend’den yolluyorsun)
  const userInput = cleanInput(input);
  const language = cleanInput(lang) || "Turkish";

  const system = `
Sen InspireApp'in PRO "Rakip Video Analizi" uzmanısın.
Amaç: Kullanıcıya PARA ETTİREN, UYGULANABİLİR, DETAYLI ve NET yönlendirme vermek.
Genel konuşma yok. Ezbere aynı şablonu tekrar etme.
Her seferinde input'a göre özgün analiz üret.
Çıktı dili: ${language}.

Kurallar:
- Eğer kullanıcı yalnızca 1-2 kelime yazdıysa (örn: "ben ve sen"), önce 3 adet kısa NET soru sor (maks 3) ve ardından yine de tahmini analiz ver.
- Cevap formatı: Kısa başlıklar + madde madde (okunabilir).
- Somut öneriler: Hook cümle örnekleri, caption örnekleri, sahne akışı (0-25 sn), CTA seçenekleri.
- "Şunu şöyle yap" diye net talimat ver.
- Gereksiz uzun teoriyi kes, ama detaylı ve üretken ol.
`.trim();

  const user = `
Girdi (video linki/açıklama/başlık/niş):
${userInput}

İstediğim:
1) Bu içerik neden izleniyor? (3-7 madde, somut)
2) Aynısını daha iyi yapmak için NET reçete:
   - 0-2 sn Hook (en az 5 farklı hook cümlesi)
   - 2-15 sn Akış (shot-by-shot / sahne planı)
   - Caption metni (5-7 kelime, 8 örnek)
   - Ekran üstü yazılar (6 örnek)
   - Ses/müzik/tempo önerisi
3) 3 adet alternatif video fikri (aynı nişte, daha viral)
4) "Benim videom" için uygulanabilir mini script (15-25 sn, satır satır)
5) Sonunda: "Hemen dene" checklist (5 madde)
`.trim();

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return json(res, 405, { message: "Sadece POST destekleniyor." });
    }

    // Email: header öncelikli, body fallback
    const headerEmail = cleanInput(req.headers["x-user-email"]);
    const bodyEmail = cleanInput(req.body?.email);
    const email = (headerEmail || bodyEmail || "").toLowerCase();

    const input = req.body?.input ?? req.body?.prompt ?? req.body?.text ?? "";
    const lang = req.body?.lang || "Turkish";

    if (!email) {
      return json(res, 401, { code: "NEED_LOGIN", message: "Devam etmek için e-posta ile giriş yap." });
    }

    // ✅ Supabase: kullanıcı kontrol
    const user = await supabaseGetUserByEmail(email);

    if (!user) {
      return json(res, 401, { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı. Lütfen tekrar giriş yap." });
    }

    const isPro = user.is_pro === true || String(user.plan || "").toLowerCase() === "pro";
    if (!isPro) {
      return json(res, 403, { code: "PRO_REQUIRED", message: "Bu özellik PRO. PRO’ya geçerek açabilirsiniz." });
    }

    const messages = buildMessages({ input, lang });

    // ✅ AbortError fix + daha hızlı
    const answer = await fetchOpenAIChat({
      messages,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxTokens: DEFAULT_MAX_TOKENS,
    });

    if (!answer) {
      return json(res, 200, { message: "Şu an içerik üretilemedi, lütfen tekrar dene." });
    }

    return json(res, 200, { message: answer });
  } catch (err) {
    // AbortError burada yakalanır
    const msg = String(err?.message || "");
    console.error("OPENAI_PRO_COMPETITOR_ERROR", err);

    // Timeout/Abort ise daha anlaşılır mesaj
    if (msg.includes("AbortError") || msg.toLowerCase().includes("aborted")) {
      return json(res, 200, { message: "Yanıt gecikti. Tekrar dene (yoğunluk olabilir)." });
    }

    // Supabase env eksikse
    if (msg === "SUPABASE_ENV_MISSING") {
      return json(res, 500, { message: "Supabase env eksik: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" });
    }

    return json(res, 200, { message: "Şu an içerik üretilemedi, lütfen tekrar dene." });
  }
}
