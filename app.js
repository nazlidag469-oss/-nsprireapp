// ===================== SABİT ANAHTARLAR =====================

const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const MAX_FREE_CREDITS = 4;

// Dil kodu -> OpenAI'ye gidecek isim
const LANG_NAMES = {
  tr: "Turkish",
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  fa: "Persian",
  hi: "Hindi",
  id: "Indonesian",
  ms: "Malay",
  th: "Thai",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  pl: "Polish",
};

// Dil -> YouTube bölge
const LANG_REGION = {
  tr: "TR",
  en: "US",
  es: "ES",
  de: "DE",
  fr: "FR",
  it: "IT",
  pt: "BR",
  ru: "RU",
  ar: "SA",
  fa: "IR",
  hi: "IN",
  id: "ID",
  ms: "MY",
  th: "TH",
  ja: "JP",
  ko: "KR",
  nl: "NL",
  sv: "SE",
  no: "NO",
  da: "DK",
  pl: "PL",
};

// Buton/metin için basit çeviriler (UI)
const UI_TEXT = {
  tr: {
    send: "Gönder",
    ad: "Reklam izle +1 puan",
    placeholder: "Mesaj yaz veya konu gir...",
  },
  en: {
    send: "Send",
    ad: "Watch Ad +1 credit",
    placeholder: "Type a message or topic...",
  },
};

// ===================== GLOBAL DURUM =====================

let conversations = [];
let currentId = null;
let currentPlan = "free"; // "free" | "pro"
let credits = MAX_FREE_CREDITS;
let currentLangCode = "tr";
let currentEmail = "";

// ===================== DURUM YÜKLE / KAYDET =====================

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) conversations = JSON.parse(raw);
  } catch {
    conversations = [];
  }

  if (!conversations.length) {
    const first = {
      id: Date.now().toString(),
      title: "Yeni sohbet",
      messages: [],
      createdAt: Date.now(),
    };
    conversations.push(first);
  }
  currentId = conversations[0].id;

  const savedPlan = localStorage.getItem(PLAN_KEY);
  if (savedPlan === "pro" || savedPlan === "free") currentPlan = savedPlan;

  const savedCredits = localStorage.getItem(CREDITS_KEY);
  if (savedCredits !== null) {
    const n = parseInt(savedCredits, 10);
    credits = Number.isNaN(n) ? MAX_FREE_CREDITS : n;
  } else {
    credits = MAX_FREE_CREDITS;
  }

  const savedLang = localStorage.getItem(LANG_KEY);
  if (savedLang && LANG_NAMES[savedLang]) currentLangCode = savedLang;

  const savedEmail = localStorage.getItem(EMAIL_KEY);
  if (savedEmail) currentEmail = savedEmail;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}
function saveCredits() {
  localStorage.setItem(CREDITS_KEY, String(credits));
}
function savePlan() {
  localStorage.setItem(PLAN_KEY, currentPlan);
}
function saveEmail() {
  if (currentEmail) localStorage.setItem(EMAIL_KEY, currentEmail);
  else localStorage.removeItem(EMAIL_KEY);
}

// ===================== YARDIMCI FONKSİYONLAR =====================

function getCurrentConversation() {
  return conversations.find((c) => c.id === currentId);
}

function renderConversationList() {
  const listEl = document.getElementById("conversationList");
  if (!listEl) return;
  listEl.innerHTML = "";
  conversations
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((conv) => {
      const item = document.createElement("div");
      item.className =
        "conversation-item" + (conv.id === currentId ? " active" : "");
      item.textContent = conv.title || "Sohbet";
      item.onclick = () => {
        currentId = conv.id;
        renderConversationList();
        renderMessages();
      };
      listEl.appendChild(item);
    });
}

function renderMessages() {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const conv = getCurrentConversation();
  container.innerHTML = "";
  conv.messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "message-row " + m.role;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = m.text;
    row.appendChild(bubble);
    container.appendChild(row);
  });
  container.scrollTop = container.scrollHeight;
}

function addMessage(role, text) {
  const conv = getCurrentConversation();
  conv.messages.push({ role, text });
  if (!conv.title && role === "user" && text) {
    conv.title = text.slice(0, 25);
  }
  saveState();
  renderConversationList();
  renderMessages();
}

function updatePlanAndCreditsUI() {
  const planLabel = document.getElementById("planLabel");
  const creditsLabel = document.getElementById("creditsLabel");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const planStatus = document.getElementById("planStatus");
  const subscribeBlock = document.getElementById("subscribeBlock");

  if (planLabel) {
    planLabel.textContent =
      currentPlan === "pro" ? "Plan: Pro (sınırsız puan)" : "Plan: Ücretsiz";
  }
  if (creditsLabel) {
    if (currentPlan === "free") {
      creditsLabel.textContent = `Kalan puan: ${credits}/${MAX_FREE_CREDITS}`;
    } else {
      creditsLabel.textContent = "Kalan puan: Sınırsız";
    }
  }
  if (watchAdBtn) {
    if (currentPlan === "free") watchAdBtn.classList.remove("hidden");
    else watchAdBtn.classList.add("hidden");
  }
  if (planStatus) {
    planStatus.textContent =
      currentPlan === "pro" ? "Plan: Pro (aktif)" : "Plan: Ücretsiz";
  }
  if (subscribeBlock) {
    if (currentPlan === "pro") subscribeBlock.classList.add("hidden");
    else subscribeBlock.classList.remove("hidden");
  }
}

function updateAccountEmailUI() {
  const accountEmail = document.getElementById("accountEmail");
  if (accountEmail) {
    accountEmail.textContent = currentEmail || "Kayıtlı değil";
  }
}

function applyUITextForLang(code) {
  const t = UI_TEXT[code] || UI_TEXT.en;
  const sendBtn = document.getElementById("sendBtn");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const messageInput = document.getElementById("messageInput");

  if (sendBtn) sendBtn.textContent = t.send;
  if (watchAdBtn) watchAdBtn.textContent = t.ad;
  if (messageInput) messageInput.placeholder = t.placeholder;
}

// ===================== API FONKSİYONLARI =====================

async function callIdeasAPI(prompt, platform, langCode) {
  const langName = LANG_NAMES[langCode] || "Turkish";

  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, platform, lang: langName }),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data && data.message) return data.message;
    } catch {
      if (text) return text;
    }
    return "API'den anlamlı bir cevap alınamadı.";
  } catch (e) {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function callSimpleAPI(route, payload) {
  // /api/series, /api/hook, /api/copy gibi
  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (data && data.message) return data.message;
    return "Sunucudan anlamlı bir cevap alınamadı.";
  } catch (e) {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function startPayment() {
  // Şimdilik sadece demo – gerçek ödeme için backend ayarlanmalı
  alert(
    "Ödeme entegrasyonu için backend'de /api/checkout ayarlanmalı. Şimdilik Pro planı test için elle aktifleştirebilirsin."
  );
}

// ===================== TRENDLER =====================

async function loadTrends(code) {
  const trendsList = document.getElementById("trendsList");
  if (!trendsList) return;

  const region = (LANG_REGION[code] || "US").toUpperCase();
  trendsList.innerHTML = "<li>Yükleniyor...</li>";

  try {
    const res = await fetch(`/api/trends?region=${region}`);
    const data = await res.json();

    if (!res.ok) {
      trendsList.innerHTML =
        "<li>Trendler alınırken hata: " + (data.message || "") + "</li>";
      return;
    }
    if (!data.items || !data.items.length) {
      trendsList.innerHTML = "<li>Bu hafta trend bulunamadı.</li>";
      return;
    }

    trendsList.innerHTML = "";
    data.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "trends-item";
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title;
      li.appendChild(a);
      trendsList.appendChild(li);
    });
  } catch (e) {
    trendsList.innerHTML =
      "<li>Trendler alınırken beklenmeyen bir hata oluştu.</li>";
  }
}

// ===================== DOM YÜKLENDİĞİNDE =====================

document.addEventListener("DOMContentLoaded", () => {
  // ---- DOM Elemanları ----
  const sidebar = document.getElementById("sidebar");
  const helpPanel = document.getElementById("helpPanel");
  const menuToggle = document.getElementById("menuToggle");
  const helpToggle = document.getElementById("helpToggle");
  const helpToggle2 = document.getElementById("helpToggle2");
  const closeHelpBtn = document.getElementById("closeHelpBtn");

  const chatForm = document.getElementById("chatForm");
  const topicInput = document.getElementById("topicInput");
  const platformSelect = document.getElementById("platformSelect");
  const langSelect = document.getElementById("langSelect");
  const messageInput = document.getElementById("messageInput");
  const loadingEl = document.getElementById("loading");
  const newChatBtn = document.getElementById("newChatBtn");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  const voiceBtn = document.getElementById("voiceBtn");
  const cameraBtn = document.getElementById("cameraBtn");

  const refreshTrendsBtn = document.getElementById("refreshTrendsBtn");
  const seriesGenerate = document.getElementById("seriesGenerate");
  const seriesTopic = document.getElementById("seriesTopic");
  const seriesResult = document.getElementById("seriesResult");
  const hookGenerate = document.getElementById("hookGenerate");
  const hookTopic = document.getElementById("hookTopic");
  const hookResult = document.getElementById("hookResult");
  const copyGenerate = document.getElementById("copyGenerate");
  const copyTopic = document.getElementById("copyTopic");
  const copyResult = document.getElementById("copyResult");

  // Reklam modal
  const modalBackdrop = document.getElementById("modalBackdrop");
  const adModal = document.getElementById("adModal");
  const adStepMain = document.getElementById("adStepMain");
  const adStepConfirm = document.getElementById("adStepConfirm");
  const adWatchedBtn = document.getElementById("adWatchedBtn");
  const adCancelBtn = document.getElementById("adCancelBtn");
  const adCloseIcon = document.getElementById("adCloseIcon");
  const adContinueBtn = document.getElementById("adContinueBtn");
  const adConfirmCloseBtn = document.getElementById("adConfirmCloseBtn");

  // Onboarding
  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  // ---- Durum başlangıç ----
  loadState();

  // Dil dropdownlarını doldur
  if (langSelect) {
    langSelect.innerHTML = "";
    Object.keys(LANG_NAMES).forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent =
        code === "tr"
          ? "Türkçe"
          : code === "en"
          ? "English"
          : LANG_NAMES[code];
      langSelect.appendChild(opt);
    });
    langSelect.value = currentLangCode;
  }

  if (onboardLangSelect) {
    onboardLangSelect.innerHTML = "";
    Object.keys(LANG_NAMES).forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent =
        code === "tr"
          ? "Türkçe"
          : code === "en"
          ? "English"
          : LANG_NAMES[code];
      onboardLangSelect.appendChild(opt);
    });
    onboardLangSelect.value = currentLangCode;
  }

  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();
  applyUITextForLang(currentLangCode);
  loadTrends(currentLangCode);

  // ---- Onboarding göster / gizle ----
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

  // ---- Menü & Yardım ----
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }
  function openHelp() {
    if (helpPanel) helpPanel.classList.remove("hidden");
  }
  function closeHelp() {
    if (helpPanel) helpPanel.classList.add("hidden");
  }
  if (helpToggle) helpToggle.addEventListener("click", openHelp);
  if (helpToggle2) helpToggle2.addEventListener("click", openHelp);
  if (closeHelpBtn) closeHelpBtn.addEventListener("click", closeHelp);

  // ---- Yeni sohbet ----
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const conv = {
        id: Date.now().toString(),
        title: "Yeni sohbet",
        messages: [],
        createdAt: Date.now(),
      };
      conversations.unshift(conv);
      currentId = conv.id;
      saveState();
      renderConversationList();
      renderMessages();
    });
  }

  // ---- Reklam Modal ----
  function openAdModal() {
    if (!modalBackdrop || !adModal || !adStepMain || !adStepConfirm) return;
    adStepMain.classList.remove("hidden");
    adStepConfirm.classList.add("hidden");
    modalBackdrop.classList.remove("hidden");
    adModal.classList.remove("hidden");
  }
  function closeAdModal() {
    if (!modalBackdrop || !adModal) return;
    modalBackdrop.classList.add("hidden");
    adModal.classList.add("hidden");
  }

  if (watchAdBtn) {
    watchAdBtn.addEventListener("click", () => {
      if (currentPlan !== "free") return;
      openAdModal();
    });
  }
  if (adCancelBtn) adCancelBtn.addEventListener("click", closeAdModal);
  if (adWatchedBtn) {
    adWatchedBtn.addEventListener("click", () => {
      credits += 1;
      saveCredits();
      updatePlanAndCreditsUI();
      closeAdModal();
    });
  }
  if (adCloseIcon && adStepMain && adStepConfirm) {
    adCloseIcon.addEventListener("click", () => {
      adStepMain.classList.add("hidden");
      adStepConfirm.classList.remove("hidden");
    });
  }
  if (adContinueBtn && adStepMain && adStepConfirm) {
    adContinueBtn.addEventListener("click", () => {
      adStepConfirm.classList.add("hidden");
      adStepMain.classList.remove("hidden");
    });
  }
  if (adConfirmCloseBtn) {
    adConfirmCloseBtn.addEventListener("click", closeAdModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeAdModal);
  }

  // ---- Onboarding eventleri ----
  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      currentLangCode = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      applyUITextForLang(code);
      loadTrends(code);
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
    });
  }

  if (onboardEmailSaveBtn && onboardEmailInput) {
    onboardEmailSaveBtn.addEventListener("click", () => {
      const email = onboardEmailInput.value.trim();
      if (!email) return;
      currentEmail = email;
      saveEmail();
      updateAccountEmailUI();
      onboardingOverlay.classList.add("hidden");
    });
  }

  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
    });
  }

  // ---- Abone ol ----
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      // Şimdilik direkt Pro yapıyoruz (demo)
      currentPlan = "pro";
      savePlan();
      updatePlanAndCreditsUI();
      alert("Pro plan deneme amaçlı olarak aktif edildi.");
      // Gerçek kullanım: startPayment();
    });
  }

  // ---- Dil seçimi (ana ekran) ----
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (LANG_NAMES[code]) {
        currentLangCode = code;
        localStorage.setItem(LANG_KEY, code);
        applyUITextForLang(code);
        loadTrends(code);
      }
    });
  }

  // ---- Panel geçişleri (Sohbet / Trend / Seri / Hook / Copy) ----
  document.querySelectorAll(".side-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.panel; // chat | trends | series | hook | copy
      document
        .querySelectorAll("main .panel")
        .forEach((sec) => sec.classList.add("hidden"));
      const active = document.getElementById(`panel-${target}`);
      if (active) active.classList.remove("hidden");
      // Panel değişince yan menüyü mobilde kapatalım
      if (sidebar) sidebar.classList.add("hidden");
    });
  });

  // ---- Kamera & Ses butonları (şimdilik info) ----
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      alert(
        "🎤 Sesli komut özelliği yakında eklenecek.\nŞimdilik metin yazarak devam edebilirsin."
      );
    });
  }
  if (cameraBtn) {
    cameraBtn.addEventListener("click", () => {
      alert(
        "📷 Kamera / video analizi özelliği yakında eklenecek.\nŞimdilik link veya metinle devam edebilirsin."
      );
    });
  }

  // ---- Trendleri elle yenile butonu ----
  if (refreshTrendsBtn) {
    refreshTrendsBtn.addEventListener("click", () => {
      loadTrends(currentLangCode);
    });
  }

  // ---- 30 Günlük Seri ----
  if (seriesGenerate && seriesTopic && seriesResult) {
    seriesGenerate.addEventListener("click", async () => {
      const topic = seriesTopic.value.trim();
      if (!topic) return;
      seriesResult.textContent = "Yükleniyor...";
      const text = await callSimpleAPI("series", { topic });
      seriesResult.textContent = text;
    });
  }

  // ---- Hook Lab ----
  if (hookGenerate && hookTopic && hookResult) {
    hookGenerate.addEventListener("click", async () => {
      const topic = hookTopic.value.trim();
      if (!topic) return;
      hookResult.textContent = "Yükleniyor...";
      const text = await callSimpleAPI("hook", { topic });
      hookResult.textContent = text;
    });
  }

  // ---- Trend Kopya Makinesi ----
  if (copyGenerate && copyTopic && copyResult) {
    copyGenerate.addEventListener("click", async () => {
      const topic = copyTopic.va
