// ==== CONSTANTS ====
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";
const MAX_FREE_CREDITS = 4;
const SUPPORT_EMAIL = "insprireappdestek@gmail.com";

const LANG_NAMES = {
  tr: "Turkish", en: "English", es: "Spanish", de: "German", fr: "French",
  it: "Italian", pt: "Portuguese", ru: "Russian", ar: "Arabic", fa: "Persian",
  hi: "Hindi", id: "Indonesian", ms: "Malay", th: "Thai", ja: "Japanese",
  ko: "Korean", nl: "Dutch", sv: "Swedish", no: "Norwegian", da: "Danish",
  pl: "Polish",
};

// Arayüz metni – kısa tutmak için sadece TR, EN, AR.
// Diğer diller EN kullanır.
const UI_TEXT = {
  tr: {
    planFree: "Plan: Ücretsiz",
    planPro: "Plan: Pro (sınırsız puan)",
    credits: (c) => `Kalan puan: ${c}/${MAX_FREE_CREDITS}`,
    creditsInf: "Kalan puan: Sınırsız",
    planStatusFree: "Plan: Ücretsiz",
    planStatusPro: "Plan: Pro (aktif)",
    btnWatchAd: "Reklam izle +1 puan",
    btnSub: "Pro’ya abone ol",
    btnChangeEmail: "E-postayı değiştir",
    helpTitle: "Bilgi & Destek",
    helpInfoTitle: "Bilgi",
    helpIntro:
      "InspireApp, kısa video içerikleri (YouTube Shorts, TikTok, Reels) için fikir üreten bir asistandır.",
    helpHowTo:
      "Konu veya mesajını yaz, platform ve dili seç, Gönder butonuna bas.",
    helpCredits:
      "Ücretsiz kullanıcılar için günlük 4 puan vardır. Her istek 1 puan tüketir. Reklam izleyerek ek puan kazanabilirsin.",
    helpPricePrefix: "Pro plan fiyatı: ",
    helpBenefitsTitle: "Pro ayrıcalıkları",
    helpB1: "Sınırsız puan",
    helpB2: "Öncelikli istek işleme",
    helpB3: "Daha uzun ve detaylı fikirler",
    helpSupportTitle: "Destek",
    helpSupportIntro:
      "Herhangi bir sorun, istek veya hata için bize e-posta gönderebilirsin:",
    helpSupportLabel: "Destek e-postası:",
    btnClose: "Kapat",
    onboardLangTitle: "Dil seçin",
    onboardLangText:
      "Uygulama dilini seçin. Bu ayar içerik dilini belirler.",
    onboardLangBtn: "Devam et",
    onboardEmailTitle: "Başlamak için e-posta adresinizi girin",
    onboardEmailText:
      "Sohbetleriniz bu cihazda e-posta bilginizle eşleşerek saklanır.",
    onboardEmailBtn: "Sohbete başla",
    apiGeneric: "API'den anlamlı bir cevap alınamadı.",
    apiNetwork: "Sunucuya bağlanırken bir hata oluştu.",
    subActivated: "Pro plan deneme amaçlı olarak aktif edildi.",
  },
  en: {
    planFree: "Plan: Free",
    planPro: "Plan: Pro (unlimited points)",
    credits: (c) => `Points left: ${c}/${MAX_FREE_CREDITS}`,
    creditsInf: "Points left: Unlimited",
    planStatusFree: "Plan: Free",
    planStatusPro: "Plan: Pro (active)",
    btnWatchAd: "Watch ad +1 point",
    btnSub: "Upgrade to Pro",
    btnChangeEmail: "Change e-mail",
    helpTitle: "Info & Support",
    helpInfoTitle: "Info",
    helpIntro:
      "InspireApp generates ideas for short videos (YouTube Shorts, TikTok, Reels).",
    helpHowTo:
      "Type a topic or message, choose platform and language, then press Send.",
    helpCredits:
      "Free users have 4 points per day. Each request costs 1 point. Watch ads to earn more.",
    helpPricePrefix: "Pro price: ",
    helpBenefitsTitle: "Pro benefits",
    helpB1: "Unlimited points",
    helpB2: "Priority processing",
    helpB3: "Longer, more detailed ideas",
    helpSupportTitle: "Support",
    helpSupportIntro: "For issues or feedback, send us an e-mail:",
    helpSupportLabel: "Support e-mail:",
    btnClose: "Close",
    onboardLangTitle: "Choose language",
    onboardLangText: "Select app language. You can change it later.",
    onboardLangBtn: "Continue",
    onboardEmailTitle: "Enter your e-mail to start",
    onboardEmailText:
      "Your chats are stored on this device linked to your e-mail.",
    onboardEmailBtn: "Start chatting",
    apiGeneric: "Could not get a meaningful answer from the API.",
    apiNetwork: "An error occurred while contacting the server.",
    subActivated: "Pro plan activated for demo purposes.",
  },
  ar: {
    planFree: "الخطة: مجانية",
    planPro: "الخطة: برو (نقاط غير محدودة)",
    credits: (c) => `النقاط المتبقية: ${c}/${MAX_FREE_CREDITS}`,
    creditsInf: "النقاط المتبقية: غير محدودة",
    planStatusFree: "الخطة: مجانية",
    planStatusPro: "الخطة: برو (مفعّلة)",
    btnWatchAd: "شاهد إعلان +1 نقطة",
    btnSub: "ترقية إلى برو",
    btnChangeEmail: "تغيير البريد الإلكتروني",
    helpTitle: "معلومات ودعم",
    helpInfoTitle: "معلومات",
    helpIntro:
      "InspireApp مساعد لتوليد أفكار لمقاطع الفيديو القصيرة (YouTube Shorts, TikTok, Reels).",
    helpHowTo:
      "اكتب الموضوع أو الرسالة، اختر المنصة واللغة ثم اضغط إرسال.",
    helpCredits:
      "للمستخدم المجاني 4 نقاط يوميًا، كل طلب يستهلك نقطة واحدة. يمكنك مشاهدة إعلان للحصول على نقاط إضافية.",
    helpPricePrefix: "سعر برو: ",
    helpBenefitsTitle: "مزايا برو",
    helpB1: "نقاط غير محدودة",
    helpB2: "أولوية في معالجة الطلبات",
    helpB3: "أفكار أطول وأكثر تفصيلاً",
    helpSupportTitle: "الدعم",
    helpSupportIntro:
      "لأي مشكلة أو اقتراح يمكنك مراسلتنا عبر البريد الإلكتروني:",
    helpSupportLabel: "بريد الدعم:",
    btnClose: "إغلاق",
    onboardLangTitle: "اختر اللغة",
    onboardLangText: "اختر لغة التطبيق، ويمكنك تغييرها لاحقًا.",
    onboardLangBtn: "متابعة",
    onboardEmailTitle: "أدخل بريدك الإلكتروني للبدء",
    onboardEmailText:
      "يتم حفظ محادثاتك على هذا الجهاز مع ربطها ببريدك الإلكتروني.",
    onboardEmailBtn: "ابدأ المحادثة",
    apiGeneric: "تعذر الحصول على رد مناسب من الـ API.",
    apiNetwork: "حدث خطأ أثناء الاتصال بالخادم.",
    subActivated: "تم تفعيل خطة برو لأغراض التجربة.",
  },
};

function P() {
  return UI_TEXT[currentLangCode] || UI_TEXT.en;
}
function priceText() {
  if (currentLangCode === "tr") return "299 TL/ay.";
  if (currentLangCode === "ar") return "19.99 USD/الشهر.";
  return "9.99 USD/month.";
}

// ===== STATE =====
let conversations = [];
let currentId = null;
let currentPlan = "free";
let credits = MAX_FREE_CREDITS;
let currentLangCode = "tr";
let currentEmail = "";

// ===== STORAGE =====
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    conversations = raw ? JSON.parse(raw) : [];
  } catch {
    conversations = [];
  }
  if (!conversations.length) {
    conversations.push({
      id: Date.now().toString(),
      title: "Yeni sohbet",
      messages: [],
      createdAt: Date.now(),
    });
  }
  currentId = conversations[0].id;
  const p = localStorage.getItem(PLAN_KEY);
  if (p === "pro" || p === "free") currentPlan = p;
  const c = parseInt(localStorage.getItem(CREDITS_KEY) || "", 10);
  credits = Number.isNaN(c) ? MAX_FREE_CREDITS : c;
  const l = localStorage.getItem(LANG_KEY);
  if (l && LANG_NAMES[l]) currentLangCode = l;
  const e = localStorage.getItem(EMAIL_KEY);
  if (e) currentEmail = e;
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

// ===== CHAT HELPERS =====
function currentConv() {
  return conversations.find((c) => c.id === currentId);
}
function renderConversationList() {
  const list = document.getElementById("conversationList");
  if (!list) return;
  list.innerHTML = "";
  conversations
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((c) => {
      const d = document.createElement("div");
      d.className = "conversation-item" + (c.id === currentId ? " active" : "");
      d.textContent = c.title || "Sohbet";
      d.onclick = () => {
        currentId = c.id;
        renderConversationList();
        renderMessages();
      };
      list.appendChild(d);
    });
}
function renderMessages() {
  const box = document.getElementById("chatMessages");
  if (!box) return;
  box.innerHTML = "";
  currentConv().messages.forEach((m) => {
    const row = document.createElement("div");
    row.className = "message-row " + m.role;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = m.text;
    row.appendChild(bubble);
    box.appendChild(row);
  });
  box.scrollTop = box.scrollHeight;
}
function addMessage(role, text) {
  const conv = currentConv();
  conv.messages.push({ role, text });
  if (!conv.title && role === "user" && text) conv.title = text.slice(0, 25);
  saveState();
  renderConversationList();
  renderMessages();
}

// ===== UI UPDATE =====
function updatePlanAndCreditsUI() {
  const T = P();
  const planLabel = document.getElementById("planLabel");
  const creditsLabel = document.getElementById("creditsLabel");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const planStatus = document.getElementById("planStatus");
  const subscribeBlock = document.getElementById("subscribeBlock");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  if (planLabel)
    planLabel.textContent = currentPlan === "pro" ? T.planPro : T.planFree;
  if (creditsLabel) {
    creditsLabel.textContent =
      currentPlan === "free" ? T.credits(credits) : T.creditsInf;
  }
  if (watchAdBtn) {
    watchAdBtn.textContent = T.btnWatchAd;
    if (currentPlan === "free") watchAdBtn.classList.remove("hidden");
    else watchAdBtn.classList.add("hidden");
  }
  if (planStatus)
    planStatus.textContent =
      currentPlan === "pro" ? T.planStatusPro : T.planStatusFree;
  if (subscribeBlock) {
    if (currentPlan === "pro") subscribeBlock.classList.add("hidden");
    else subscribeBlock.classList.remove("hidden");
  }
  if (subscribeBtn) subscribeBtn.textContent = T.btnSub;
  if (changeEmailBtn) changeEmailBtn.textContent = T.btnChangeEmail;
}
function updateAccountEmailUI() {
  const el = document.getElementById("accountEmail");
  if (el) el.textContent = currentEmail || "Kayıtlı değil";
}
function renderHelpPanel(onClose) {
  const T = P();
  const help = document.getElementById("helpPanel");
  if (!help) return;
  help.innerHTML = `
    <h2>${T.helpTitle}</h2>
    <h3>${T.helpInfoTitle}</h3>
    <p>${T.helpIntro}</p>
    <p>${T.helpHowTo}</p>
    <p>${T.helpCredits}</p>
    <p><strong>${T.helpPricePrefix}${priceText()}</strong></p>
    <h3>${T.helpBenefitsTitle}</h3>
    <ul>
      <li>${T.helpB1}</li>
      <li>${T.helpB2}</li>
      <li>${T.helpB3}</li>
    </ul>
    <h3>${T.helpSupportTitle}</h3>
    <p>${T.helpSupportIntro}</p>
    <p>${T.helpSupportLabel}
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
    <button id="closeHelpBtn" class="pill-button">${T.btnClose}</button>
  `;
  const btn = document.getElementById("closeHelpBtn");
  if (btn && onClose) btn.addEventListener("click", onClose);
}
function updateOnboardingTexts() {
  const T = P();
  const lt = document.getElementById("onboardLangTitle");
  const lx = document.getElementById("onboardLangText");
  const lb = document.getElementById("onboardLangSaveBtn");
  const et = document.getElementById("onboardEmailTitle");
  const ex = document.getElementById("onboardEmailText");
  const eb = document.getElementById("onboardEmailSaveBtn");
  if (lt) lt.textContent = T.onboardLangTitle;
  if (lx) lx.textContent = T.onboardLangText;
  if (lb) lb.textContent = T.onboardLangBtn;
  if (et) et.textContent = T.onboardEmailTitle;
  if (ex) ex.textContent = T.onboardEmailText;
  if (eb) eb.textContent = T.onboardEmailBtn;
}

// ===== API =====
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
    return P().apiGeneric;
  } catch {
    return P().apiNetwork;
  }
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const helpPanel = document.getElementById("helpPanel");
  const menuToggle = document.getElementById("menuToggle");
  const helpToggle = document.getElementById("helpToggle");
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

  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  loadState();
  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();
  if (langSelect) langSelect.value = currentLangCode;

  const closeHelp = () => helpPanel && helpPanel.classList.add("hidden");
  renderHelpPanel(closeHelp);
  updateOnboardingTexts();

  // Menü & yardım
  if (menuToggle && sidebar)
    menuToggle.addEventListener("click", () =>
      sidebar.classList.toggle("hidden")
    );
  if (helpToggle && helpPanel)
    helpToggle.addEventListener("click", () =>
      helpPanel.classList.remove("hidden")
    );

  // Yeni sohbet
  if (newChatBtn)
    newChatBtn.addEventListener("click", () => {
      conversations.unshift({
        id: Date.now().toString(),
        title: "Yeni sohbet",
        messages: [],
        createdAt: Date.now(),
      });
      currentId = conversations[0].id;
      saveState();
      renderConversationList();
      renderMessages();
    });

  // Reklam modalı
  function openAd() {
    if (!modalBackdrop || !adModal || !adStepMain || !adStepConfirm) return;
    adStepMain.classList.remove("hidden");
    adStepConfirm.classList.add("hidden");
    modalBackdrop.classList.remove("hidden");
    adModal.classList.remove("hidden");
  }
  function closeAd() {
    if (!modalBackdrop || !adModal) return;
    modalBackdrop.classList.add("hidden");
    adModal.classList.add("hidden");
  }
  if (watchAdBtn)
    watchAdBtn.addEventListener("click", () => {
      if (currentPlan === "free") openAd();
    });
  if (adCancelBtn) adCancelBtn.addEventListener("click", closeAd);
  if (adWatchedBtn)
    adWatchedBtn.addEventListener("click", () => {
      credits += 1;
      saveCredits();
      updatePlanAndCreditsUI();
      closeAd();
    });
  if (adCloseIcon)
    adCloseIcon.addEventListener("click", () => {
      adStepMain.classList.add("hidden");
      adStepConfirm.classList.remove("hidden");
    });
  if (adContinueBtn)
    adContinueBtn.addEventListener("click", () => {
      adStepConfirm.classList.add("hidden");
      adStepMain.classList.remove("hidden");
    });
  if (adConfirmCloseBtn) adConfirmCloseBtn.addEventListener("click", closeAd);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeAd);

  // Onboarding
  function showOnboardingIfNeeded() {
    if (!onboardingOverlay) return;
    const hasLang = !!localStorage.getItem(LANG_KEY);
    const hasEmail = !!localStorage.getItem(EMAIL_KEY);
    updateOnboardingTexts();
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
  if (onboardLangSaveBtn && onboardLangSelect)
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      if (!LANG_NAMES[code]) return;
      currentLangCode = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      updatePlanAndCreditsUI();
      renderHelpPanel(closeHelp);
      showOnboardingIfNeeded();
    });
  if (onboardEmailSaveBtn && onboardEmailInput)
    onboardEmailSaveBtn.addEventListener("click", () => {
      const email = onboardEmailInput.value.trim();
      if (!email) return;
      currentEmail = email;
      saveEmail();
      updateAccountEmailUI();
      if (onboardingOverlay) onboardingOverlay.classList.add("hidden");
    });
  showOnboardingIfNeeded();

  // Menüden e-posta değiştirme
  if (changeEmailBtn)
    changeEmailBtn.addEventListener("click", () => {
      if (!onboardingOverlay) return;
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
      updateOnboardingTexts();
    });

  // Pro’ya geç – şimdilik demo
  if (subscribeBtn)
    subscribeBtn.addEventListener("click", () => {
      currentPlan = "pro";
      savePlan();
      updatePlanAndCreditsUI();
      alert(P().subActivated);
    });

  // Ana ekrandan dil değişimi
  if (langSelect)
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (!LANG_NAMES[code]) return;
      currentLangCode = code;
      localStorage.setItem(LANG_KEY, code);
      updatePlanAndCreditsUI();
      renderHelpPanel(closeHelp);
      updateOnboardingTexts();
    });

  // Mesaj gönderme
  if (chatForm)
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text =
        (messageInput && messageInput.value.trim()) ||
        (topicInput && topicInput.value.trim());
      if (!text) return;
      if (currentPlan === "free" && credits <= 0) {
        openAd();
        return;
      }
      const platform = platformSelect ? platformSelect.value : "youtube";
      addMessage("user", text);
      if (messageInput) messageInput.value = "";
      if (topicInput) topicInput.value = "";
      if (loadingEl) loadingEl.classList.remove("hidden");
      const reply = await callIdeasAPI(text, platform, currentLangCode);
      if (loadingEl) loadingEl.classList.add("hidden");
      addMessage("assistant", reply);
      if (currentPlan === "free") {
        credits = Math.max(credits - 1, 0);
        saveCredits();
        updatePlanAndCreditsUI();
      }
    });
});
