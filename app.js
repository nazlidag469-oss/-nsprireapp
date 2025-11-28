const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const MAX_FREE_CREDITS = 4;

const LANG_NAMES = {
  tr: "Turkish",
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
};

let conversations = [];
let currentId = null;
let currentPlan = "free";
let credits = MAX_FREE_CREDITS;
let currentCountry = "tr"; // "tr" veya "other"
let currentLangCode = "tr"; // onboarding ile seçilecek dil

/* ======= SOHBET DURUMU ======= */

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

  // Plan
  const savedPlan = localStorage.getItem("inspireapp_plan");
  if (savedPlan) currentPlan = savedPlan;

  // Ülke
  const savedCountry = localStorage.getItem("inspireapp_country");
  if (savedCountry === "tr" || savedCountry === "other") {
    currentCountry = savedCountry;
  }

  // Dil
  const savedLangCode = localStorage.getItem("inspireapp_lang");
  if (savedLangCode && LANG_NAMES[savedLangCode]) {
    currentLangCode = savedLangCode;
  }

  // Puanlar (sadece free için anlamlı)
  const savedCredits = localStorage.getItem(CREDITS_KEY);
  if (savedCredits !== null) {
    credits = parseInt(savedCredits, 10);
    if (Number.isNaN(credits)) credits = MAX_FREE_CREDITS;
  } else {
    credits = MAX_FREE_CREDITS;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function saveCredits() {
  localStorage.setItem(CREDITS_KEY, String(credits));
}

function getCurrent() {
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
  const conv = getCurrent();
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
  const conv = getCurrent();
  conv.messages.push({ role, text });
  if (!conv.title && role === "user" && text) {
    conv.title = text.slice(0, 25);
  }
  saveState();
  renderConversationList();
  renderMessages();
}

/* ======= PLAN & PUAN UI ======= */

function updatePlanAndCreditsUI() {
  const planLabel = document.getElementById("planLabel");
  const creditsLabel = document.getElementById("creditsLabel");
  const watchAdBtn = document.getElementById("watchAdBtn");

  if (!planLabel || !creditsLabel || !watchAdBtn) return;

  let planText = "Plan: Ücretsiz";
  if (currentPlan === "pro") planText = "Plan: Pro (sınırsız)";
  if (currentPlan === "team") planText = "Plan: Takım (sınırsız)";

  const countryText =
    currentCountry === "tr" ? "Ülke: Türkiye" : "Ülke: Diğer ülkeler";

  planLabel.textContent = `${countryText} | ${planText}`;

  if (currentPlan === "free") {
    creditsLabel.textContent = `Kalan puan: ${credits}/${MAX_FREE_CREDITS}`;
    watchAdBtn.classList.remove("hidden");
  } else {
    creditsLabel.textContent = "Kalan puan: Sınırsız";
    watchAdBtn.classList.add("hidden");
  }
}

/* ======= API ÇAĞRILARI ======= */

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

async function startPayment(plan) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, country: currentCountry }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Ödeme oturumu oluşturulamadı.");
    }
  } catch (e) {
    alert("Ödeme başlatılırken hata oluştu.");
  }
}

/* ======= DOM EVENTS ======= */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const helpPanel = document.getElementById("helpPanel");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const helpToggle = document.getElementById("helpToggle");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const chatForm = document.getElementById("chatForm");
  const topicInput = document.getElementById("topicInput");
  const platformSelect = document.getElementById("platformSelect");
  const langSelect = document.getElementById("langSelect");
  const messageInput = document.getElementById("messageInput");
  const loadingEl = document.getElementById("loading");
  const newChatBtn = document.getElementById("newChatBtn");

  const emailInput = document.getElementById("emailInput");
  const emailSaveBtn = document.getElementById("emailSaveBtn");
  const emailSavedText = document.getElementById("emailSavedText");
  const planSelect = document.getElementById("planSelect");
  const planSaveBtn = document.getElementById("planSaveBtn");
  const planSavedText = document.getElementById("planSavedText");
  const payBtn = document.getElementById("payBtn");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const countrySelect = document.getElementById("countrySelect");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const adModal = document.getElementById("adModal");

  const adStepMain = document.getElementById("adStepMain");
  const adStepConfirm = document.getElementById("adStepConfirm");
  const adWatchedBtn = document.getElementById("adWatchedBtn");
  const adCancelBtn = document.getElementById("adCancelBtn");
  const adCloseIcon = document.getElementById("adCloseIcon");
  const adContinueBtn = document.getElementById("adContinueBtn");
  const adConfirmCloseBtn = document.getElementById("adConfirmCloseBtn");

  // Onboarding elemanları
  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  /* Durumu yükle */
  loadState();
  renderConversationList();
  renderMessages();

  // Plan & ülke & dil select ilk hal
  if (planSelect) planSelect.value = currentPlan;
  if (countrySelect) countrySelect.value = currentCountry;
  if (langSelect) langSelect.value = currentLangCode;
  updatePlanAndCreditsUI();

  /* Ülke seçimi */
  if (countrySelect) {
    countrySelect.addEventListener("change", () => {
      currentCountry = countrySelect.value;
      localStorage.setItem("inspireapp_country", currentCountry);
      updatePlanAndCreditsUI();
    });
  }

  /* Dil seçimi (ana kontrollerde) */
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      currentLangCode = langSelect.value;
      localStorage.setItem("inspireapp_lang", currentLangCode);
    });
  }

  /* Sol menü */
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
    });
  }

  /* Yardım */
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

  /* Yeni sohbet */
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

  /* E-posta kaydet (sidebar) */
  const savedEmail = localStorage.getItem("inspireapp_email");
  if (savedEmail && emailInput && emailSavedText) {
    emailInput.value = savedEmail;
    emailSavedText.textContent = "Kayıtlı: " + savedEmail;
  }
  if (emailSaveBtn && emailInput && emailSavedText) {
    emailSaveBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      if (!email) return;
      localStorage.setItem("inspireapp_email", email);
      emailSavedText.textContent = "Kayıt edildi: " + email;
    });
  }

  /* Plan kaydet */
  if (currentPlan && planSelect && planSavedText) {
    planSelect.value = currentPlan;
    planSavedText.textContent = "Aktif plan: " + currentPlan;
  }
  if (planSaveBtn && planSelect && planSavedText) {
    planSaveBtn.addEventListener("click", () => {
      const plan = planSelect.value;
      currentPlan = plan;
      localStorage.setItem("inspireapp_plan", plan);
      planSavedText.textContent = "Aktif plan: " + plan;

      if (plan === "free" && credits > MAX_FREE_CREDITS) {
        credits = MAX_FREE_CREDITS;
        saveCredits();
      }
      updatePlanAndCreditsUI();
    });
  }

  /* Ödeme */
  if (payBtn && planSelect) {
    payBtn.addEventListener("click", () => {
      const plan = planSelect.value;
      startPayment(plan);
    });
  }

  /* ======= REKLAM MODALI ======= */

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

  /* ======= ONBOARDING (Dil + E-posta) ======= */

  function showOnboardingIfNeeded() {
    if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;

    const hasLang = !!localStorage.getItem("inspireapp_lang");
    const hasEmail = !!localStorage.getItem("inspireapp_email");

    if (hasLang && hasEmail) {
      onboardingOverlay.classList.add("hidden");
      return;
    }

    onboardingOverlay.classList.remove("hidden");

    if (!hasLang) {
      onboardStepLang.classList.remove("hidden");
      onboardStepEmail.classList.add("hidden");
    } else if (!hasEmail) {
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
    }
  }

  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      currentLangCode = code;
      localStorage.setItem("inspireapp_lang", code);
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
      localStorage.setItem("inspireapp_email", email);

      if (emailInput) emailInput.value = email;
      if (emailSavedText) emailSavedText.textContent = "Kayıt edildi: " + email;

      if (onboardingOverlay) onboardingOverlay.classList.add("hidden");
    });
  }

  showOnboardingIfNeeded();

  /* ======= MESAJ GÖNDERME ======= */

  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = messageInput.value.trim() || topicInput.value.trim();
      if (!text) return;

      const platform = platformSelect ? platformSelect.value : "youtube";
      const langCode = currentLangCode;

      if (currentPlan === "free") {
        if (credits <= 0) {
          openAdModal();
          return;
        }
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
