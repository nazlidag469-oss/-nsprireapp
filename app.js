// =========================
// === LOCAL STORAGE KEYS ===
// =========================
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const AD_COUNT_KEY = "inspireapp_daily_ad_count_v1";
const AD_DATE_KEY = "inspireapp_daily_ad_date_v1";

const MAX_FREE_CREDITS = 4;
const DAILY_AD_LIMIT = 400;

// =========================
// === NETWORK SETTINGS  ===
// =========================
const API_TIMEOUT_MS = 25000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const finalOptions = {
    cache: "no-store",
    ...options,
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      ...(options.headers || {}),
    },
    signal: controller.signal,
  };

  try {
    return await fetch(url, finalOptions);
  } finally {
    clearTimeout(id);
  }
}

// =========================
// === LANGUAGE TABLES    ===
// =========================
const LANG_NAMES = { tr: "Turkish", en: "English", ar: "Arabic", de: "German", es: "Spanish" };
const LANG_REGION = { tr: "TR", en: "US", ar: "SA", de: "DE", es: "ES" };
const LANG_LABELS = { tr: "Türkçe", en: "English", ar: "العربية", de: "Deutsch", es: "Español" };
const LANG_SPEECH = { tr: "tr-TR", en: "en-US", ar: "ar-SA", de: "de-DE", es: "es-ES" };

// NOT: Senin gönderdiğin I18N bloğu aynen kalsın (çok uzun diye burada kısaltmıyorum).
// Aşağıya kendi I18N objeni olduğu gibi yapıştırabilirsin.
const I18N = window.I18N || {
  tr: {
    loadingText: "Yükleniyor...",
    freeNoCreditsAlert: "Ücretsiz planda kredi bitti. Reklam izleyerek +1 alabilirsin.",
    planFreeLabel: "Plan: Ücretsiz",
    planProLabel: "Plan: Pro (sınırsız puan)",
    creditsLabelFree: (c) => `Kalan puan: ${c}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Kalan puan: Sınırsız",
    adDailyLimit: (limit) => `Günlük reklam limiti doldu. (Limit: ${limit})`,
    proPriceTextTr: "InspireApp PRO – aylık 299 TL (Google Play üzerinden ücretlendirilir).",
    proPriceTextEn: "InspireApp PRO – monthly subscription via Google Play.",
  },
  en: {
    loadingText: "Loading...",
    freeNoCreditsAlert: "You ran out of credits. Watch an ad to get +1.",
    planFreeLabel: "Plan: Free",
    planProLabel: "Plan: Pro (unlimited credits)",
    creditsLabelFree: (c) => `Credits: ${c}/${MAX_FREE_CREDITS}`,
    creditsLabelPro: "Credits: Unlimited",
    adDailyLimit: (limit) => `Daily ad limit reached. (Limit: ${limit})`,
    proPriceTextTr: "InspireApp PRO – monthly subscription via Google Play.",
    proPriceTextEn: "InspireApp PRO – monthly subscription via Google Play.",
  },
};

// Small legacy UI_TEXT support (kalsın)
const UI_TEXT = {
  tr: { send: "Gönder", ad: "Reklam izle +1 puan", placeholder: "Mesaj yaz veya konu gir..." },
  en: { send: "Send", ad: "Watch Ad +1 credit", placeholder: "Type a message or topic..." },
  ar: { send: "إرسال", ad: "شاهد إعلانًا +1 نقطة", placeholder: "اكتب رسالة أو فكرة..." },
  de: { send: "Senden", ad: "Werbung ansehen +1 Punkt", placeholder: "Nachricht oder Thema eingeben..." },
  es: { send: "Enviar", ad: "Ver anuncio +1 crédito", placeholder: "Escribe un mensaje o tema..." },
};

// =========================
// === GLOBAL STATE       ===
// =========================
const state = {
  conversations: [],
  currentId: null,
  plan: "free",
  credits: MAX_FREE_CREDITS,
  lang: "tr",
  email: "",
};

// Panel geçmişi (geri tuşu için)
let currentPanel = "chat";
let previousPanel = null;

// Web içi geri butonu
let softBackBtn = null;

// =========================
// === HELPERS            ===
// =========================
const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.conversations = JSON.parse(raw);
  } catch {
    state.conversations = [];
  }
  if (!state.conversations.length) {
    state.conversations.push({
      id: Date.now().toString(),
      title: "Yeni sohbet",
      messages: [],
      createdAt: Date.now(),
    });
  }
  state.currentId = state.conversations[0].id;

  const p = localStorage.getItem(PLAN_KEY);
  if (p === "pro" || p === "free") state.plan = p;

  const cStr = localStorage.getItem(CREDITS_KEY);
  const c = parseInt(cStr || "", 10);
  state.credits = Number.isNaN(c) ? MAX_FREE_CREDITS : c;

  const l = localStorage.getItem(LANG_KEY);
  if (l && LANG_NAMES[l]) state.lang = l;

  const e = localStorage.getItem(EMAIL_KEY);
  if (e) state.email = e;
}

function saveConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations));
}
function saveCredits() {
  localStorage.setItem(CREDITS_KEY, String(state.credits));
}
function savePlan() {
  localStorage.setItem(PLAN_KEY, state.plan);
}
function saveEmail() {
  if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
  else localStorage.removeItem(EMAIL_KEY);
}

function currentConv() {
  return state.conversations.find((c) => c.id === state.currentId);
}

function buildTitleFromText(text) {
  if (!text) return "Sohbet";
  let line = text.split("\n")[0];
  line = line.split(/[.!?]/)[0].trim();
  if (!line) line = text.trim();
  if (line.length > 40) line = line.slice(0, 40) + "…";
  return line || "Sohbet";
}

// =========================
// === UI: MODALS         ===
// =========================
function openProModal() {
  const modalBackdrop = $("modalBackdrop");
  const proModal = $("proModal");
  const proPriceText = $("proPriceText");
  if (!modalBackdrop || !proModal) return;

  const t = I18N[state.lang] || I18N.tr;
  const isTr = state.lang === "tr";
  if (proPriceText) proPriceText.textContent = isTr ? t.proPriceTextTr : t.proPriceTextEn;

  modalBackdrop.classList.remove("hidden");
  proModal.classList.remove("hidden");
}

function closeProModal() {
  const modalBackdrop = $("modalBackdrop");
  const proModal = $("proModal");
  if (!proModal) return;
  proModal.classList.add("hidden");
  if (modalBackdrop) modalBackdrop.classList.add("hidden");
}

function openAdModal() {
  const modalBackdrop = $("modalBackdrop");
  const adModal = $("adModal");
  const adStepMain = $("adStepMain");
  const adStepConfirm = $("adStepConfirm");
  if (!modalBackdrop || !adModal) return;
  if (adStepMain) adStepMain.classList.remove("hidden");
  if (adStepConfirm) adStepConfirm.classList.add("hidden");
  modalBackdrop.classList.remove("hidden");
  adModal.classList.remove("hidden");
}

function closeAdModal() {
  const modalBackdrop = $("modalBackdrop");
  const adModal = $("adModal");
  if (!adModal) return;
  adModal.classList.add("hidden");
  if (modalBackdrop) modalBackdrop.classList.add("hidden");
}

// =========================
– === PANEL SWITCH (FIX)  ===
// =========================
function showPanel(name) {
  // 🔒 PRO KİLİDİ: Ücretsizse PRO panel asla açılmayacak
  if (name === "pro" && state.plan !== "pro") {
    openProModal();
    return;
  }

  const panels = document.querySelectorAll("main .panel");
  if (!panels.length) return;
  if (name === currentPanel) return;

  previousPanel = currentPanel;
  currentPanel = name;

  panels.forEach((sec) => sec.classList.add("hidden"));
  const active = document.getElementById("panel-" + name);
  if (active) active.classList.remove("hidden");
}

// =========================
// === RENDER             ===
// =========================
function renderConversationList() {
  const listEl = $("conversationList");
  if (!listEl) return;
  listEl.innerHTML = "";

  function handleDelete(convId) {
    const confirmText =
      state.lang === "tr"
        ? "Bu sohbeti silmek istiyor musun?"
        : state.lang === "ar"
        ? "هل تريد حذف هذه الدردشة؟"
        : state.lang === "de"
        ? "Möchtest du diesen Chat löschen?"
        : state.lang === "es"
        ? "¿Quieres eliminar este chat?"
        : "Do you want to delete this chat?";
    if (!confirm(confirmText)) return;

    state.conversations = state.conversations.filter((c) => c.id !== convId);
    if (!state.conversations.length) {
      state.conversations.push({
        id: Date.now().toString(),
        title: state.lang === "tr" ? "Yeni sohbet" : "New chat",
        messages: [],
        createdAt: Date.now(),
      });
    }
    state.currentId = state.conversations[0].id;
    saveConversations();
    renderConversationList();
    renderMessages();
  }

  state.conversations
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((conv) => {
      const item = document.createElement("div");
      item.className =
        "conversation-item" + (conv.id === state.currentId ? " active" : "");
      item.textContent = conv.title || "Sohbet";

      item.addEventListener("click", () => {
        state.currentId = conv.id;
        renderConversationList();
        renderMessages();
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!("ontouchstart" in window)) handleDelete(conv.id);
      });

      let pressTimer = null;
      const LONG_PRESS_DURATION = 600;

      item.addEventListener(
        "touchstart",
        () => {
          pressTimer = setTimeout(
            () => handleDelete(conv.id),
            LONG_PRESS_DURATION
          );
        },
        { passive: true }
      );

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };
      ["touchend", "touchmove", "touchcancel"].forEach((ev) =>
        item.addEventListener(ev, cancelPress)
      );

      listEl.appendChild(item);
    });
}

function renderMessages() {
  const container = $("chatMessages");
  if (!container) return;
  const conv = currentConv();
  container.innerHTML = "";

  conv.messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "message-row " + m.role;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const textEl = document.createElement("pre");
    textEl.className = "bubble-text";
    textEl.textContent = m.text;

    bubble.appendChild(textEl);
    row.appendChild(bubble);
    container.appendChild(row);
  });

  container.scrollTop = container.scrollHeight;
}

function addMessage(role, text) {
  const conv = currentConv();
  conv.messages.push({ role, text });
  const idx = conv.messages.length - 1;

  if (!conv.title || conv.title === "Yeni sohbet" || conv.title === "New chat") {
    const firstUserMsg = conv.messages.find((m) => m.role === "user");
    if (firstUserMsg?.text) conv.title = buildTitleFromText(firstUserMsg.text);
  }
  saveConversations();
  renderConversationList();
  renderMessages();
  return idx;
}

function updateMessageAt(index, newText) {
  const conv = currentConv();
  if (!conv || !conv.messages || !conv.messages[index]) return;
  conv.messages[index].text = newText;
  saveConversations();
  renderMessages();
}

// =========================
// === PLAN & CREDITS UI  ===
// =========================
function updatePlanAndCreditsUI() {
  const t = I18N[state.lang] || I18N.tr;
  const planLabel = $("planLabel");
  const creditsLabel = $("creditsLabel");
  const watchAdBtn = $("watchAdBtn");
  const planStatus = $("planStatus");
  const subscribeBlock = $("subscribeBlock");

  if (planLabel)
    planLabel.textContent =
      state.plan === "pro" ? t.planProLabel : t.planFreeLabel;
  if (creditsLabel) {
    creditsLabel.textContent =
      state.plan === "pro"
        ? t.creditsLabelPro
        : t.creditsLabelFree
        ? t.creditsLabelFree(state.credits)
        : "";
  }
  if (watchAdBtn) watchAdBtn.classList.toggle("hidden", state.plan !== "free");
  if (planStatus)
    planStatus.textContent =
      state.plan === "pro" ? t.planProLabel : t.planFreeLabel;
  if (subscribeBlock)
    subscribeBlock.classList.toggle("hidden", state.plan === "pro");
}

function updateAccountEmailUI() {
  const el = $("accountEmail");
  if (!el) return;
  const notSaved =
    state.lang === "tr"
      ? "Kayıtlı değil"
      : state.lang === "ar"
      ? "غير محفوظ"
      : state.lang === "de"
      ? "Nicht gespeichert"
      : state.lang === "es"
      ? "No guardado"
      : "Not set";
  el.textContent = state.email || notSaved;
}

function applySmallUIText(code) {
  const t = UI_TEXT[code] || UI_TEXT.en;
  const sendBtn = $("sendBtnText");
  const watchAdBtn = $("watchAdBtnText");
  const messageInput = $("messageInput");
  if (sendBtn) sendBtn.textContent = t.send;
  if (watchAdBtn) watchAdBtn.textContent = t.ad;
  if (messageInput && !messageInput.value)
    messageInput.placeholder = t.placeholder;
}

function fillLangSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  Object.keys(LANG_NAMES).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = LANG_LABELS[code] || code;
    selectEl.appendChild(opt);
  });
  selectEl.value = state.lang;
}

// =========================
// === API FUNCTIONS       ===
// =========================
function isProRequiredResponse(res, textOrJson) {
  if (res && (res.status === 401 || res.status === 403)) return true;
  const s =
    typeof textOrJson === "string"
      ? textOrJson
      : JSON.stringify(textOrJson || {});
  return /PRO_REQUIRED|pro_required|PRO ONLY|PRO_ONLY/i.test(s);
}

async function callIdeasAPI(prompt, platform, langCode) {
  const langName = LANG_NAMES[langCode] || "Turkish";
  try {
    const res = await fetchWithTimeout("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, platform, lang: langName }),
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data?.message) return data.message;
      if (data?.result) return data.result;
    } catch {}
    return text || "Şu an yanıt üretilemedi, lütfen tekrar dene.";
  } catch {
    return "Şu an yanıt üretilemedi, lütfen tekrar dene.";
  }
}

async function callSimpleAPI(route, payload) {
  try {
    const res = await fetchWithTimeout(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    // 🔒 Sunucu "PRO lazım" diyorsa: modal aç
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    if (isProRequiredResponse(res, json || text)) {
      openProModal();
      return state.lang === "tr"
        ? "Bu içerik PRO gerektirir. PRO’ya geçerek açabilirsin."
        : "This content requires PRO. Upgrade to unlock.";
    }

    if (json?.message) return json.message;
    if (json?.result) return json.result;
    if (json?.answer) return json.answer;
    if (json?.content) return json.content;

    return text || "Şu an içerik üretilemedi, lütfen tekrar dene.";
  } catch {
    return "Şu an içerik üretilemedi, lütfen tekrar dene.";
  }
}

// 🔥 PRO ARAÇLARI İÇİN ÖZEL YARDIMCI
async function callProTool(mode, input) {
  const langCode = state.lang || "tr";
  const langName = LANG_NAMES[langCode] || "Turkish";

  // 1) Önce kendi backend endpoint’ini dene
  let route;
  if (mode === "competitor") route = "pro-competitor";
  else if (mode === "audience") route = "pro-audience";
  else if (mode === "silent") route = "pro-silent";
  else route = "pro-generic";

  const basePayload = {
    email: state.email || "",
    input,
    lang: langName,
    plan: state.plan,
    region: LANG_REGION[langCode] || "TR",
    mode,
  };

  let primary = await callSimpleAPI(route, basePayload);

  const BAD_TEXTS = [
    "Sunucudan anlamlı bir cevap alınamadı",
    "no meaningful response",
    "INTERNAL_ERROR",
  ];

  const isBad =
    !primary ||
    primary.trim().length < 10 ||
    BAD_TEXTS.some((p) =>
      primary.toLowerCase().includes(p.toLowerCase())
    );

  if (!isBad) return primary;

  // 2) Fallback: ideas endpoint’i ile güçlü prompt
  let prefix;
  switch (mode) {
    case "competitor":
      prefix =
        "You are a professional short-form video growth strategist. " +
        "Analyze the competitor channel/video below in depth and return a detailed report in " +
        langName +
        ". Focus on:\n" +
        "- Content topics, hooks, title patterns, thumbnail style\n" +
        "- Posting frequency and best-performing ideas\n" +
        "- Concrete, actionable suggestions for my own videos.";
      break;
    case "audience":
      prefix =
        "You are an expert audience researcher for TikTok / Reels / Shorts. " +
        "Based on the description below, map the exact target audience in " +
        langName +
        " and generate:\n" +
        "- Demographics, pains, desires, hidden motivations\n" +
        "- Content angles that would emotionally trigger them\n" +
        "- At least 10 concrete video ideas.";
      break;
    case "silent":
      prefix =
        "You are a \"silent viewer\" analyst. " +
        "Assume you secretly watched the described channel/video for a week. " +
        "In " +
        langName +
        ", explain:\n" +
        "- What this creator is really doing well\n" +
        "- What feels weak or fake to viewers\n" +
        "- What radical changes could 3x their performance.";
      break;
    default:
      prefix =
        "You are a senior social media strategist. Give high quality insights in " +
        langName +
        ".";
  }

  const emailInfo = state.email ? `Kullanıcı e-postası: ${state.email}\n` : "";
  const proFlag = "[PRO_TOOL: " + mode + "]";

  const prompt =
    proFlag +
    "\n" +
    emailInfo +
    "Dil: " +
    langName +
    "\n\n" +
    prefix +
    "\n\n---\nKullanıcının girişi:\n" +
    input;

  const fallback = await callIdeasAPI(prompt, "youtube", langCode);
  if (fallback && fallback.trim().length > 0) return fallback;

  return langCode === "tr"
    ? "Şu an içerik üretilemedi. Lütfen biraz sonra tekrar dene."
    : "Content could not be generated. Please try again later.";
}

async function loadTrends() {
  const list = $("trendsList");
  if (!list) return;
  const region = (LANG_REGION[state.lang] || "US").toUpperCase();
  list.innerHTML = "<li>Yükleniyor...</li>";
  try {
    const res = await fetchWithTimeout(`/api/trends?region=${region}`, {
      method: "GET",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      list.innerHTML =
        "<li>Trendler alınırken hata: " +
        ((data && data.message) || "") +
        "</li>";
      return;
    }
    if (!data?.items?.length) {
      list.innerHTML = "<li>Bu hafta trend bulunamadı.</li>";
      return;
    }
    list.innerHTML = "";
    data.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "trends-item";
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch {
    list.innerHTML =
      "<li>Trendler alınırken beklenmeyen bir hata oluştu.</li>";
  }
}

// =========================
// === AD CREDIT FUNCTION  ===
// =========================
function grantAdCredit() {
  if (state.plan !== "free") return;

  const t = I18N[state.lang] || I18N.tr;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = localStorage.getItem(AD_DATE_KEY);
  let storedCount = parseInt(
    localStorage.getItem(AD_COUNT_KEY) || "0",
    10
  );

  if (storedDate !== today) storedCount = 0;
  if (storedCount >= DAILY_AD_LIMIT) {
    alert(t.adDailyLimit ? t.adDailyLimit(DAILY_AD_LIMIT) : "");
    return;
  }

  storedCount += 1;
  localStorage.setItem(AD_DATE_KEY, today);
  localStorage.setItem(AD_COUNT_KEY, String(storedCount));

  state.credits += 1;
  saveCredits();
  updatePlanAndCreditsUI();
}

// Android-side aliases
window.__onRewardedAdCompletedFromAndroid = function () {
  grantAdCredit();
};
window.__onRealAdReward = function () {
  grantAdCredit();
};

// Android PRO plan activation
window.__setProPlanFromAndroid = function () {
  state.plan = "pro";
  savePlan();
  updatePlanAndCreditsUI();
  alert("🎉 PRO üyelik Google Play üzerinden aktif edildi!");
};

// =========================
// === ANDROID BACK       ===
// =========================
window.__inspireHandleBack = function () {
  const onboarding = $("onboardingOverlay");
  if (onboarding && !onboarding.classList.contains("hidden")) {
    onboarding.classList.add("hidden");
    return true;
  }

  const proModal = $("proModal");
  if (proModal && !proModal.classList.contains("hidden")) {
    closeProModal();
    return true;
  }

  const adModal = $("adModal");
  if (adModal && !adModal.classList.contains("hidden")) {
    closeAdModal();
    return true;
  }

  const helpPanel = $("helpPanel");
  if (helpPanel && !helpPanel.classList.contains("hidden")) {
    helpPanel.classList.add("hidden");
    return true;
  }

  const sidebar = $("sidebar");
  if (sidebar && !sidebar.classList.contains("hidden")) {
    sidebar.classList.add("hidden");
    return true;
  }

  // Panel geçmişi: örn. PRO alt sayfa -> PRO -> chat
  if (currentPanel && currentPanel !== "chat") {
    const target = previousPanel || "chat";
    showPanel(target);
    return true;
  }

  // Chat panelindeyken bile uygulamadan çıkma
  return true;
};

// =========================
// === DOM READY          ===
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  const sidebar = $("sidebar");
  const helpPanel = $("helpPanel");
  const menuToggle = $("menuToggle");
  const helpToggle = $("helpToggle");
  const helpToggle2 = $("helpToggle2");
  const closeHelpBtn = $("closeHelpBtn");

  const chatForm = $("chatForm");
  const topicInput = $("topicInput");
  const platformSelect = $("platformSelect");
  const langSelect = $("langSelect");
  const messageInput = $("messageInput");
  const loadingEl = $("loading");
  const newChatBtn = $("newChatBtn");
  const watchAdBtn = $("watchAdBtn");
  const subscribeBtn = $("subscribeBtn");
  const changeEmailBtn = $("changeEmailBtn");

  const voiceBtn = $("voiceBtn");
  const cameraBtn = $("cameraBtn");
  const cameraFileInput = $("cameraFileInput");

  const refreshTrendsBtn = $("refreshTrendsBtn");
  const seriesGenerate = $("seriesGenerate");
  const seriesTopic = $("seriesTopic");
  const seriesResult = $("seriesResult");
  const hookGenerate = $("hookGenerate");
  const hookTopic = $("hookTopic");
  const hookResult = $("hookResult");
  const copyGenerate = $("copyGenerate");
  const copyTopic = $("copyTopic");
  const copyResult = $("copyResult");

  const proCompetitorInput = $("proCompetitorInput");
  const proCompetitorBtn = $("proCompetitorBtn");
  const proCompetitorResult = $("proCompetitorResult");
  const proAudienceInput = $("proAudienceInput");
  const proAudienceBtn = $("proAudienceBtn");
  const proAudienceResult = $("proAudienceResult");
  const proSilentInput = $("proSilentInput");
  const proSilentBtn = $("proSilentBtn");
  const proSilentResult = $("proSilentResult");

  const modalBackdrop = $("modalBackdrop");
  const adCloseIcon = $("adCloseIcon");
  const adCancelBtn = $("adCancelBtn");
  const adWatchedBtn = $("adWatchedBtn");
  const adContinueBtn = $("adContinueBtn");
  const adConfirmCloseBtn = $("adConfirmCloseBtn");
  const adStepMain = $("adStepMain");
  const adStepConfirm = $("adStepConfirm");

  const proCloseBtn = $("proCloseBtn");
  const proPayBtn = $("proPayBtn");

  const onboardingOverlay = $("onboardingOverlay");
  const onboardStepLang = $("onboardStepLang");
  const onboardStepEmail = $("onboardStepEmail");
  const onboardLangSelect = $("onboardLangSelect");
  const onboardLangSaveBtn = $("onboardLangSaveBtn");
  const onboardEmailInput = $("onboardEmailInput");
  const onboardPasswordInput = $("onboardPasswordInput");
  const onboardEmailSaveBtn = $("onboardEmailSaveBtn");

  // Dil select doldur
  fillLangSelect(langSelect);
  fillLangSelect(onboardLangSelect);

  // Initial render
  renderConversationList();
  renderMessages();
  applySmallUIText(state.lang);
  updateAccountEmailUI();
  updatePlanAndCreditsUI();
  loadTrends();

  // Web içi geri butonu
  if (!softBackBtn) {
    softBackBtn = document.createElement("button");
    softBackBtn.id = "softBackBtn";
    softBackBtn.textContent = "◀";
    softBackBtn.style.position = "fixed";
    softBackBtn.style.left = "16px";
    softBackBtn.style.bottom = "16px";
    softBackBtn.style.zIndex = "9999";
    softBackBtn.style.width = "44px";
    softBackBtn.style.height = "44px";
    softBackBtn.style.borderRadius = "999px";
    softBackBtn.style.border = "none";
    softBackBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    softBackBtn.style.background =
      "linear-gradient(135deg, #ffffff, #f3e9ff)";
    softBackBtn.style.fontSize = "20px";
    softBackBtn.style.display = "flex";
    softBackBtn.style.alignItems = "center";
    softBackBtn.style.justifyContent = "center";
    softBackBtn.style.cursor = "pointer";
    softBackBtn.style.userSelect = "none";
    document.body.appendChild(softBackBtn);

    softBackBtn.addEventListener("click", () => {
      if (
        typeof window.__inspireHandleBack === "function" &&
        window.__inspireHandleBack()
      )
        return;
      if (currentPanel !== "chat") showPanel(previousPanel || "chat");
    });
  }

  // Onboarding
  function showOnboardingIfNeeded() {
    if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;
    const hasLang = !!localStorage.getItem(LANG_KEY);
    const hasEmail = !!localStorage.getItem(EMAIL_KEY);
    if (hasLang && hasEmail) {
      onboardingOverlay.classList.add("hidden");
      return;
    }
    onboardingOverlay.classList.remove("hidden");
    if (!hasLang) {
      onboardStepLang.classList.remove("hidden");
      onboardStepEmail.classList.add("hidden");
    } else {
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
    }
  }
  showOnboardingIfNeeded();

  // Sidebar toggle
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () =>
      sidebar.classList.toggle("hidden")
    );
  }

  // Swipe ile sidebar kapatma (sadece sidebar için)
  let swipeStartX = null;
  document.addEventListener("touchstart", (e) => {
    if (!sidebar || sidebar.classList.contains("hidden")) return;
    if (!e.touches?.length) return;
    swipeStartX = e.touches[0].clientX;
  });
  document.addEventListener("touchend", (e) => {
    if (swipeStartX === null) return;
    if (!sidebar || sidebar.classList.contains("hidden")) {
      swipeStartX = null;
      return;
    }
    if (!e.changedTouches?.length) return;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - swipeStartX;
    if (Math.abs(diffX) > 60) sidebar.classList.add("hidden");
    swipeStartX = null;
  });

  // Help
  const openHelp = () =>
    helpPanel && helpPanel.classList.remove("hidden");
  const closeHelp = () =>
    helpPanel && helpPanel.classList.add("hidden");
  if (helpToggle) helpToggle.addEventListener("click", openHelp);
  if (helpToggle2) helpToggle2.addEventListener("click", openHelp);
  if (closeHelpBtn) closeHelpBtn.addEventListener("click", closeHelp);

  // New chat
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const conv = {
        id: Date.now().toString(),
        title: state.lang === "tr" ? "Yeni sohbet" : "New chat",
        messages: [],
        createdAt: Date.now(),
      };
      state.conversations.unshift(conv);
      state.currentId = conv.id;
      saveConversations();
      renderConversationList();
      renderMessages();
    });
  }

  // Backdrop click closes modals
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target !== modalBackdrop) return;
      closeAdModal();
      closeProModal();
    });
  }

  // Ad modal buttons
  if (watchAdBtn) {
    watchAdBtn.addEventListener("click", () => {
      if (state.plan !== "free") return;
      if (
        window.AndroidAds &&
        typeof window.AndroidAds.showRewardedAd === "function"
      ) {
        window.AndroidAds.showRewardedAd();
      } else {
        openAdModal();
      }
    });
  }
  if (adCancelBtn) adCancelBtn.addEventListener("click", closeAdModal);
  if (adWatchedBtn)
    adWatchedBtn.addEventListener("click", () => {
      grantAdCredit();
      closeAdModal();
    });
  if (adCloseIcon) {
    adCloseIcon.addEventListener("click", () => {
      if (adStepMain) adStepMain.classList.add("hidden");
      if (adStepConfirm) adStepConfirm.classList.remove("hidden");
    });
  }
  if (adContinueBtn) {
    adContinueBtn.addEventListener("click", () => {
      if (adStepConfirm) adStepConfirm.classList.add("hidden");
      if (adStepMain) adStepMain.classList.remove("hidden");
    });
  }
  if (adConfirmCloseBtn)
    adConfirmCloseBtn.addEventListener("click", closeAdModal);

  // Pro modal close
  if (proCloseBtn) proCloseBtn.addEventListener("click", closeProModal);

  // Subscribe button opens PRO modal
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      if (state.plan === "pro") return;
      openProModal();
    });
  }

  // Pro pay button -> Android Billing
  if (proPayBtn) {
    proPayBtn.addEventListener("click", () => {
      const isTr = state.lang === "tr";
      if (window.AndroidBilling && window.AndroidBilling.startPurchase) {
        const sku = isTr ? "pro_monthly_tr" : "pro_monthly_intl";
        window.AndroidBilling.startPurchase(sku);
      } else {
        alert(
          isTr
            ? "Bu web sürümünde gerçek ödeme yok. Android uygulamada Google Play satın alma açılacak."
            : "Billing is not enabled in web preview. Use Android build for Google Play purchase."
        );
      }
    });
  }

  // Onboarding language
  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      applySmallUIText(code);
      loadTrends();
      updatePlanAndCreditsUI();
      if (onboardStepLang) onboardStepLang.classList.add("hidden");
      if (onboardStepEmail) onboardStepEmail.classList.remove("hidden");
    });
  }

  // Onboarding login/register
  if (onboardEmailSaveBtn && onboardEmailInput && onboardPasswordInput) {
    onboardEmailSaveBtn.addEventListener("click", async () => {
      const email = onboardEmailInput.value.trim();
      const password = onboardPasswordInput.value.trim();
      if (!email || !password) {
        alert(
          state.lang === "tr"
            ? "Lütfen e-posta ve şifre girin."
            : "Please enter email and password."
        );
        return;
      }

      state.email = email;
      saveEmail();
      updateAccountEmailUI();

      try {
        const res = await fetchWithTimeout("/api/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            plan: state.plan,
            credits: state.credits,
            lang: state.lang,
          }),
        });

        const data = await res.json().catch(() => null);

        if (res.status === 401 && data?.code === "INVALID_PASSWORD") {
          alert(
            state.lang === "tr"
              ? "Şifre yanlış. Lütfen tekrar deneyin."
              : "Wrong password."
          );
          return;
        }
        if (!res.ok || !data)
          throw new Error(data?.error || data?.message || "Sunucu hatası");

        if (data.status === "login")
          alert(
            state.lang === "tr"
              ? "Giriş başarılı. 👌"
              : "Login successful. 👌"
          );
        else if (data.status === "registered")
          alert(
            state.lang === "tr"
              ? "Hesap oluşturuldu ve giriş yapıldı. 🎉"
              : "Account created and logged in. 🎉"
          );

        if (onboardingOverlay) onboardingOverlay.classList.add("hidden");
      } catch (e) {
        alert(
          (state.lang === "tr"
            ? "Giriş/kayıt hatası: "
            : "Login/register error: ") + (e.message || "")
        );
      }
    });
  }

  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      if (!onboardingOverlay) return;
      if (onboardStepLang) onboardStepLang.classList.add("hidden");
      if (onboardStepEmail) onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
    });
  }

  // Lang select change
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (!LANG_NAMES[code]) return;
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      applySmallUIText(code);
      loadTrends();
      updatePlanAndCreditsUI();
    });
  }

  // ✅ PANEL BUTTONS (PRO kilidi showPanel içinde)
  document.querySelectorAll(".side-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.panel;
      showPanel(target);
      if (sidebar) sidebar.classList.add("hidden");
    });
  });

  // Voice
  let recognition = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = LANG_SPEECH[state.lang] || "en-US";
    recognition.interimResults = false;
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!recognition) {
        alert(
          state.lang === "tr"
            ? "Bu tarayıcıda ses tanıma desteklenmiyor. (Chrome önerilir)"
            : "Speech recognition is not supported in this browser. (Chrome recommended)"
        );
        return;
      }
      try {
        recognition.lang = LANG_SPEECH[state.lang] || "en-US";
        recognition.start();
      } catch {}
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎤…";

      recognition.onresult = (ev) => {
        const text = ev.results?.[0]?.[0]?.transcript || "";
        if (messageInput && text)
          messageInput.value = (messageInput.value + " " + text).trim();
      };
      recognition.onerror = () =>
        alert(
          state.lang === "tr"
            ? "Ses tanıma sırasında hata oldu."
            : "Speech recognition error."
        );
      recognition.onend = () => {
        voiceBtn.disabled = false;
        voiceBtn.textContent = "🎤";
      };
    });
  }

  // Camera
  if (cameraBtn && cameraFileInput) {
    cameraBtn.addEventListener("click", () => cameraFileInput.click());
    cameraFileInput.addEventListener("change", () => {
      const file = cameraFileInput.files?.[0];
      if (!file) return;
      const info = `[DOSYA: ${file.name}]`;
      if (messageInput)
        messageInput.value = messageInput.value
          ? messageInput.value + " " + info
          : info;
    });
  }

  // Trends refresh
  if (refreshTrendsBtn)
    refreshTrendsBtn.addEventListener("click", loadTrends);

  // Series / Hook / Copy
  if (seriesGenerate && seriesTopic && seriesResult) {
    seriesGenerate.addEventListener("click", async () => {
      const topic = seriesTopic.value.trim();
      if (!topic) return;
      const t = I18N[state.lang] || I18N.tr;
      seriesResult.textContent = t.loadingText || "Yükleniyor...";
      seriesResult.textContent = await callSimpleAPI("series", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
    });
  }

  if (hookGenerate && hookTopic && hookResult) {
    hookGenerate.addEventListener("click", async () => {
      const topic = hookTopic.value.trim();
      if (!topic) return;
      const t = I18N[state.lang] || I18N.tr;
      hookResult.textContent = t.loadingText || "Yükleniyor...";
      hookResult.textContent = await callSimpleAPI("hook", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
    });
  }

  if (copyGenerate && copyTopic && copyResult) {
    copyGenerate.addEventListener("click", async () => {
      const topic = copyTopic.value.trim();
      if (!topic) return;
      const t = I18N[state.lang] || I18N.tr;
      copyResult.textContent = t.loadingText || "Yükleniyor...";
      copyResult.textContent = await callSimpleAPI("copy", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
    });
  }

  // ✅ PRO tools (artık callProTool kullanıyor)
  if (proCompetitorBtn && proCompetitorInput && proCompetitorResult) {
    proCompetitorBtn.addEventListener("click", async () => {
      if (state.plan !== "pro") {
        proCompetitorResult.textContent =
          state.lang === "tr"
            ? "Bu özellik sadece PRO kullanıcılar içindir."
            : "This feature is available only for PRO users.";
        openProModal();
        return;
      }
      const value = proCompetitorInput.value.trim();
      if (!value) return;
      const t = I18N[state.lang] || I18N.tr;
      proCompetitorResult.textContent = t.loadingText || "Yükleniyor...";
      proCompetitorResult.textContent = await callProTool(
        "competitor",
        value
      );
    });
  }

  if (proAudienceBtn && proAudienceInput && proAudienceResult) {
    proAudienceBtn.addEventListener("click", async () => {
      if (state.plan !== "pro") {
        proAudienceResult.textContent =
          state.lang === "tr"
            ? "Bu özellik sadece PRO kullanıcılar içindir."
            : "This feature is available only for PRO users.";
        openProModal();
        return;
      }
      const value = proAudienceInput.value.trim();
      if (!value) return;
      const t = I18N[state.lang] || I18N.tr;
      proAudienceResult.textContent = t.loadingText || "Yükleniyor...";
      proAudienceResult.textContent = await callProTool("audience", value);
    });
  }

  if (proSilentBtn && proSilentInput && proSilentResult) {
    proSilentBtn.addEventListener("click", async () => {
      if (state.plan !== "pro") {
        proSilentResult.textContent =
          state.lang === "tr"
            ? "Bu özellik sadece PRO kullanıcılar içindir."
            : "This feature is available only for PRO users.";
        openProModal();
        return;
      }
      const value = proSilentInput.value.trim();
      if (!value) return;
      const t = I18N[state.lang] || I18N.tr;
      proSilentResult.textContent = t.loadingText || "Yükleniyor...";
      proSilentResult.textContent = await callProTool("silent", value);
    });
  }

  // Chat submit
  if (chatForm && topicInput && platformSelect && messageInput && loadingEl) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const t = I18N[state.lang] || I18N.tr;
      const topic = (topicInput.value || "").trim();
      const extra = (messageInput.value || "").trim();
      const platform = platformSelect.value || "tiktok";

      const basePrompt = extra ? `${topic}\n\n${extra}` : topic;
      if (!basePrompt) return;

      const prompt =
        state.plan === "pro"
          ? "[PRO_USER] Kullanıcı PRO planda. Daha detaylı, özgün, ileri seviye kısa video fikirleri üret.\n\n" +
            basePrompt
          : basePrompt;

      if (state.plan === "free" && state.credits <= 0) {
        alert(t.freeNoCreditsAlert);
        return;
      }

      addMessage("user", prompt);
      const pendingIdx = addMessage(
        "assistant",
        t.loadingText || "Yükleniyor..."
      );
      loadingEl.classList.remove("hidden");

      const reply = await callIdeasAPI(prompt, platform, state.lang);
      updateMessageAt(pendingIdx, reply);

      loadingEl.classList.add("hidden");

      if (state.plan === "free") {
        state.credits = Math.max(0, state.credits - 1);
        saveCredits();
        updatePlanAndCreditsUI();
      }

      topicInput.value = "";
      messageInput.value = "";
    });
  }
});

// =========================
// === PWA: Service Worker ===
// =========================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker yüklendi ✔"))
    .catch((err) => console.error("SW hatası:", err));
}
