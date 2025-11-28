// Basit sabitler
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

let conversations = [];
let currentId = null;
let currentPlan = "free"; // "free" veya "pro"
let credits = MAX_FREE_CREDITS;
let currentLangCode = "tr";
let currentEmail = "";

/* ========= DURUM YÜKLE / KAYDET ========= */

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
  if (savedPlan === "pro" || savedPlan === "free") {
    currentPlan = savedPlan;
  }

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
  if (currentEmail) {
    localStorage.setItem(EMAIL_KEY, currentEmail);
  } else {
    localStorage.removeItem(EMAIL_KEY);
  }
}

/* ========= YARDIMCI ========= */

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

/* ========= PLAN / PUAN UI ========= */

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
    if (currentPlan === "free") {
      watchAdBtn.classList.remove("hidden");
    } else {
      watchAdBtn.classList.add("hidden");
    }
  }

  if (planStatus) {
    planStatus.textContent =
      currentPlan === "pro" ? "Plan: Pro (aktif)" : "Plan: Ücretsiz";
  }

  if (subscribeBlock) {
    if (currentPlan === "pro") {
      subscribeBlock.classList.add("hidden");
    } else {
      subscribeBlock.classList.remove("hidden");
    }
  }
}

function updateAccountEmailUI() {
  const accountEmail = document.getElementById("accountEmail");
  if (accountEmail) {
    accountEmail.textContent = currentEmail || "Kayıtlı değil";
  }
}

/* ========= API ========= */

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

// Şimdilik demo: gerçek ödeme entegrasyonunda /api/checkout yazılacak
async function startPayment() {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro" }),
    });

    const data = await res.json().catch(() => null);
    if (data && data.url) {
      window.location.href = data.url;
    } else {
      alert(
        "Ödeme entegrasyonu henüz tam bağlanmadı. Backend tarafında /api/checkout ayarlanmalı."
      );
    }
  } catch (e) {
    alert("Ödeme başlatılırken hata oluştu.");
  }
}

/* ========= DOM BAŞLANGIÇ ========= */

document.addEventListener("DOMContentLoaded", () => {
  // Elemanları al
  const sidebar = document.getElementById("sidebar");
  const helpPanel = document.getElementById("helpPanel");
  const menuToggle = document.getElementById("menuToggle");
  const helpToggle = document.getElementById("helpToggle");
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

  // Durumu yükle
  loadState();
  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();

  if (langSelect) langSelect.value = currentLangCode;

  /* === Menü & Yardım === */

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }

  if (helpToggle && helpPanel) {
    helpToggle.addEventListener("click", () => {
      helpPanel.classList.remove("hidden");
    });
  }

  if (closeHelpBtn && helpPanel) {
    closeHelpBtn.addEventListener("click", () => {
      helpPanel.classList.add("hidden");
    });
  }

  /* === Yeni sohbet === */

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

  /* === Reklam modalı === */

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

  if (adCancelBtn) {
    adCancelBtn.addEventListener("click", () => {
      closeAdModal();
    });
  }

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
    adConfirmCloseBtn.addEventListener("click", () => {
      closeAdModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", () => {
      closeAdModal();
    });
  }

  /* === Onboarding (Dil + E-posta) === */

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

  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      currentLangCode = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      if (onboardStepLang && onboardStepEmail) {
        onboardStepLang.classList.add("hidden");
        onboardStepEmail.classList.remove("hidden");
      }
    });
  }

  if (onboardEmailSaveBtn && onboardEmailInput) {
    onboardEmailSaveBtn.addEventListener("click", () => {
      const email = onboardEmailInput.value.trim();
      if (!email) return;
      currentEmail = email;
      saveEmail();
      updateAccountEmailUI();
      if (onboardingOverlay) onboardingOverlay.classList.add("hidden");
    });
  }

  showOnboardingIfNeeded();

  // Üç nokta menüsünden e-posta değiştirme
  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      // sadece e-posta adımını tekrar göster
      if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
    });
  }

  /* === Abone ol butonu === */

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      // Şimdilik demo: direkt planı pro yapıyoruz.
      // İstersen buraya startPayment() çağrısı bağlayabilirsin.
      // startPayment();
      currentPlan = "pro";
      savePlan();
      updatePlanAndCreditsUI();
      alert("Pro plan deneme amaçlı olarak aktif edildi.");
    });
  }

  /* === Dil seçimi (ana ekran) === */

  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (LANG_NAMES[code]) {
        currentLangCode = code;
        localStorage.setItem(LANG_KEY, code);
      }
    });
  }

  /* === Mesaj gönderme === */

  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = (messageInput.value || "").trim() ||
        (topicInput ? topicInput.value.trim() : "");
      if (!text) return;

      const platform = platformSelect ? platformSelect.value : "youtube";
      const langCode = currentLangCode;

      if (currentPlan === "free" && credits <= 0) {
        openAdModal();
        return;
      }

      addMessage("user", text);
      messageInput.value = "";
      if (topicInput) topicInput.value = "";

      if (loadingEl) loadingEl.classList.remove("hidden");
      const reply = await callIdeasAPI(text, platform, langCode);
      if (loadingEl) loadingEl.classList.add("hidden");
      addMessage("assistant", reply);

      if (currentPlan === "free") {
        credits = Math.max(credits - 1, 0);
        saveCredits();
        updatePlanAndCreditsUI();
      }
    });
  }
});
