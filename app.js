// ====== SABİTLER ======
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const MAX_FREE_CREDITS = 4;
const SUPPORT_EMAIL = "insprireappdestek@gmail.com";

// OpenAI için dil isimleri
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

// Arayüz metinleri (kısa tutmak için sadece 3 dil tam; diğerleri İngilizceye düşer)
const UI_TEXT = {
  tr: {
    plan_free_label: "Plan: Ücretsiz",
    plan_pro_label: "Plan: Pro (sınırsız puan)",
    credits_free: (c) => `Kalan puan: ${c}/${MAX_FREE_CREDITS}`,
    credits_unlimited: "Kalan puan: Sınırsız",
    plan_status_free: "Plan: Ücretsiz",
    plan_status_pro: "Plan: Pro (aktif)",
    btn_watch_ad: "Reklam izle +1 puan",
    btn_subscribe: "Pro'ya geç",
    subscribe_title: "Pro'ya yükselt",
    subscribe_text: "Sınırsız puan ve ekstra ayrıcalıklar için Pro plana geç.",
    btn_change_email: "E-postayı değiştir",

    help_title: "Bilgi & Destek",
    help_info_heading: "Bilgi",
    help_info_intro:
      "InspireApp, kısa video içerikleri (YouTube Shorts, TikTok, Reels) için fikir üreten bir asistandır.",
    help_info_howto:
      "Sohbet alanında konu veya mesajını yaz, platform ve dili seç, Gönder butonuna bas.",
    help_info_credits:
      "Ücretsiz kullanıcılar için günlük 4 puan vardır. Her istek 1 puan tüketir. Reklam izleyerek ek puan kazanabilirsin.",
    help_info_price: "Pro plan fiyatı: Türkiye'de 299 TL/ay.",
    help_pro_benefits_title: "Pro plan ayrıcalıkları",
    help_pro_benefit1: "Sınırsız puan",
    help_pro_benefit2: "Öncelikli istek işleme",
    help_pro_benefit3: "Daha uzun ve detaylı içerik önerileri",
    help_support_heading: "Destek",
    help_support_intro:
      "Herhangi bir sorun, istek veya hata için bize e-posta gönderebilirsin:",
    help_support_email_prefix: "Destek e-postası:",
    btn_close: "Kapat",

    onboard_lang_title: "Dil seçin",
    onboard_lang_text:
      "Uygulama dilini seçin. Bu ayarı daha sonra değiştirebilirsiniz.",
    onboard_lang_button: "Devam et",
    onboard_email_title: "Başlamak için e-posta adresinizi girin",
    onboard_email_text:
      "Sohbetleriniz bu cihazda e-posta bilginizle eşleşerek saklanır.",
    onboard_email_button: "Sohbete başla",

    api_error_generic: "API'den anlamlı bir cevap alınamadı.",
    api_error_network: "Sunucuya bağlanırken bir hata oluştu.",
    subscribe_demo_activated: "Pro plan deneme amaçlı olarak aktif edildi.",
    payment_not_ready:
      "Ödeme entegrasyonu için backend tarafında /api/checkout ayarlanmalı.",
    payment_error: "Ödeme başlatılırken hata oluştu.",
  },
  en: {
    plan_free_label: "Plan: Free",
    plan_pro_label: "Plan: Pro (unlimited points)",
    credits_free: (c) => `Points left: ${c}/${MAX_FREE_CREDITS}`,
    credits_unlimited: "Points left: Unlimited",
    plan_status_free: "Plan: Free",
    plan_status_pro: "Plan: Pro (active)",
    btn_watch_ad: "Watch ad +1 point",
    btn_subscribe: "Upgrade to Pro",
    subscribe_title: "Upgrade to Pro",
    subscribe_text:
      "Get unlimited points and extra features with the Pro plan.",
    btn_change_email: "Change e-mail",

    help_title: "Info & Support",
    help_info_heading: "Info",
    help_info_intro:
      "InspireApp is an assistant that generates ideas for short-form videos (YouTube Shorts, TikTok, Reels).",
    help_info_howto:
      "Type a topic or message, choose platform and language, then press Send.",
    help_info_credits:
      "Free users have 4 points per day. Each request costs 1 point. Watch ads to earn more points.",
    help_info_price: "Pro price: 9.99 USD/month.",
    help_pro_benefits_title: "Pro benefits",
    help_pro_benefit1: "Unlimited points",
    help_pro_benefit2: "Priority processing",
    help_pro_benefit3: "Longer, more detailed ideas",
    help_support_heading: "Support",
    help_support_intro: "For issues or feedback, send us an e-mail:",
    help_support_email_prefix: "Support e-mail:",
    btn_close: "Close",

    onboard_lang_title: "Choose language",
    onboard_lang_text: "Select the app language. You can change it later.",
    onboard_lang_button: "Continue",
    onboard_email_title: "Enter your e-mail to start",
    onboard_email_text:
      "Your conversations are stored on this device linked to your e-mail.",
    onboard_email_button: "Start chatting",

    api_error_generic: "Could not get a meaningful answer from the API.",
    api_error_network: "An error occurred while contacting the server.",
    subscribe_demo_activated: "Pro plan activated for demo purposes.",
    payment_not_ready:
      "Payment integration is not configured yet. Backend /api/checkout required.",
    payment_error: "An error occurred while starting the payment.",
  },
  ar: {
    plan_free_label: "الخطة: مجانية",
    plan_pro_label: "الخطة: برو (نقاط غير محدودة)",
    credits_free: (c) => `النقاط المتبقية: ${c}/${MAX_FREE_CREDITS}`,
    credits_unlimited: "النقاط المتبقية: غير محدودة",
    plan_status_free: "الخطة: مجانية",
    plan_status_pro: "الخطة: برو (مفعّلة)",
    btn_watch_ad: "شاهد إعلان +1 نقطة",
    btn_subscribe: "ترقية إلى برو",
    subscribe_title: "ترقية إلى برو",
    subscribe_text:
      "احصل على نقاط غير محدودة ومزايا إضافية مع خطة برو.",
    btn_change_email: "تغيير البريد الإلكتروني",

    help_title: "معلومات ودعم",
    help_info_heading: "معلومات",
    help_info_intro:
      "InspireApp مساعد لتوليد أفكار لمقاطع الفيديو القصيرة (YouTube Shorts, TikTok, Reels).",
    help_info_howto:
      "اكتب الموضوع أو الرسالة، اختر المنصة واللغة ثم اضغط إرسال.",
    help_info_credits:
      "للمستخدم المجاني 4 نقاط يوميًا، كل طلب يستهلك نقطة واحدة. يمكنك مشاهدة إعلان للحصول على نقاط إضافية.",
    help_info_price: "سعر برو: 19.99 دولار أمريكي شهريًا.",
    help_pro_benefits_title: "مزايا برو",
    help_pro_benefit1: "نقاط غير محدودة",
    help_pro_benefit2: "أولوية في معالجة الطلبات",
    help_pro_benefit3: "أفكار أطول وأكثر تفصيلاً",
    help_support_heading: "الدعم",
    help_support_intro:
      "لأي مشكلة أو اقتراح يمكنك مراسلتنا عبر البريد الإلكتروني:",
    help_support_email_prefix: "بريد الدعم:",
    btn_close: "إغلاق",

    onboard_lang_title: "اختر اللغة",
    onboard_lang_text: "اختر لغة التطبيق، ويمكنك تغييرها لاحقًا.",
    onboard_lang_button: "متابعة",
    onboard_email_title: "أدخل بريدك الإلكتروني للبدء",
    onboard_email_text:
      "يتم حفظ محادثاتك على هذا الجهاز مع ربطها ببريدك الإلكتروني.",
    onboard_email_button: "ابدأ المحادثة",

    api_error_generic: "تعذر الحصول على رد مناسب من الـ API.",
    api_error_network: "حدث خطأ أثناء الاتصال بالخادم.",
    subscribe_demo_activated: "تم تفعيل خطة برو لأغراض التجربة.",
    payment_not_ready:
      "ميزة الدفع غير مكتملة بعد، يجب إعداد /api/checkout في الخادم.",
    payment_error: "حدث خطأ أثناء بدء عملية الدفع.",
  },
};

function pack() {
  return UI_TEXT[currentLangCode] || UI_TEXT.en || UI_TEXT.tr;
}

// ====== STATE ======
let conversations = [];
let currentId = null;
let currentPlan = "free";
let credits = MAX_FREE_CREDITS;
let currentLangCode = "tr";
let currentEmail = "";

// ====== STORAGE ======
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

// ====== HELPERS ======
function currentConversation() {
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
      const div = document.createElement("div");
      div.className =
        "conversation-item" + (conv.id === currentId ? " active" : "");
      div.textContent = conv.title || "Sohbet";
      div.onclick = () => {
        currentId = conv.id;
        renderConversationList();
        renderMessages();
      };
      listEl.appendChild(div);
    });
}

function renderMessages() {
  const box = document.getElementById("chatMessages");
  if (!box) return;
  box.innerHTML = "";
  currentConversation().messages.forEach((m) => {
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
  const conv = currentConversation();
  conv.messages.push({ role, text });
  if (!conv.title && role === "user" && text) {
    conv.title = text.slice(0, 25);
  }
  saveState();
  renderConversationList();
  renderMessages();
}

// ====== UI ======
function updatePlanAndCreditsUI() {
  const pck = pack();
  const planLabel = document.getElementById("planLabel");
  const creditsLabel = document.getElementById("creditsLabel");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const planStatus = document.getElementById("planStatus");
  const subscribeBlock = document.getElementById("subscribeBlock");
  const subscribeTitle = document.getElementById("subscribeTitle");
  const subscribeText = document.getElementById("subscribeText");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  if (planLabel)
    planLabel.textContent =
      currentPlan === "pro" ? pck.plan_pro_label : pck.plan_free_label;

  if (creditsLabel) {
    if (currentPlan === "free") creditsLabel.textContent = pck.credits_free(credits);
    else creditsLabel.textContent = pck.credits_unlimited;
  }

  if (watchAdBtn) {
    if (currentPlan === "free") {
      watchAdBtn.classList.remove("hidden");
      watchAdBtn.textContent = pck.btn_watch_ad;
    } else watchAdBtn.classList.add("hidden");
  }

  if (planStatus)
    planStatus.textContent =
      currentPlan === "pro" ? pck.plan_status_pro : pck.plan_status_free;

  if (subscribeBlock) {
    if (currentPlan === "pro") subscribeBlock.classList.add("hidden");
    else subscribeBlock.classList.remove("hidden");
  }

  if (subscribeTitle) subscribeTitle.textContent = pck.subscribe_title;
  if (subscribeText) subscribeText.textContent = pck.subscribe_text;
  if (subscribeBtn) subscribeBtn.textContent = pck.btn_subscribe;
  if (changeEmailBtn) changeEmailBtn.textContent = pck.btn_change_email;
}

function updateAccountEmailUI() {
  const el = document.getElementById("accountEmail");
  if (el) el.textContent = currentEmail || "Kayıtlı değil";
}

function renderHelpPanelContent(onClose) {
  const pck = pack();
  const helpPanel = document.getElementById("helpPanel");
  if (!helpPanel) return;

  helpPanel.innerHTML = `
    <h2>${pck.help_title}</h2>
    <h3>${pck.help_info_heading}</h3>
    <p>${pck.help_info_intro}</p>
    <p>${pck.help_info_howto}</p>
    <p>${pck.help_info_credits}</p>
    <p><strong>${pck.help_info_price}</strong></p>
    <h3>${pck.help_pro_benefits_title}</h3>
    <ul>
      <li>${pck.help_pro_benefit1}</li>
      <li>${pck.help_pro_benefit2}</li>
      <li>${pck.help_pro_benefit3}</li>
    </ul>
    <h3>${pck.help_support_heading}</h3>
    <p>${pck.help_support_intro}</p>
    <p>${pck.help_support_email_prefix}
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
    <button id="closeHelpBtn" class="pill-button">${pck.btn_close}</button>
  `;
  const closeBtn = document.getElementById("closeHelpBtn");
  if (closeBtn && onClose) closeBtn.addEventListener("click", onClose);
}

// ====== API ======
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
    return pack().api_error_generic;
  } catch {
    return pack().api_error_network;
  }
}

// ====== MAIN ======
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

  // Onboarding
  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  // Durum yükle
  loadState();
  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();
  if (langSelect) langSelect.value = currentLangCode;

  // Yardım paneli için close handler
  const closeHelp = () => helpPanel && helpPanel.classList.add("hidden");
  renderHelpPanelContent(closeHelp);

  // Menü
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

  // Yeni sohbet
  if (newChatBtn) {
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
  }

  // Reklam modalı
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
  if (adWatchedBtn)
    adWatchedBtn.addEventListener("click", () => {
      credits += 1;
      saveCredits();
      updatePlanAndCreditsUI();
      closeAdModal();
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
  if (adConfirmCloseBtn) adConfirmCloseBtn.addEventListener("click", closeAdModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeAdModal);

  // Onboarding
  function showOnboardingIfNeeded() {
    if (!onboardingOverlay || !onboardStepLang || !onboardStepEmail) return;
    const hasLang = !!localStorage.getItem(LANG_KEY);
    const hasEmail = !!localStorage.getItem(EMAIL_KEY);
    const pck = pack();

    // başlıkları güncelle
    const langTitle = document.getElementById("onboardLangTitle");
    const langText = document.getElementById("onboardLangText");
    const emailTitle = document.getElementById("onboardEmailTitle");
    const emailText = document.getElementById("onboardEmailText");
    const emailBtn = document.getElementById("onboardEmailButton");
    const langBtn = document.getElementById("onboardLangButton");
    if (langTitle) langTitle.textContent = pck.onboard_lang_title;
    if (langText) langText.textContent = pck.onboard_lang_text;
    if (langBtn) langBtn.textContent = pck.onboard_lang_button;
    if (emailTitle) emailTitle.textContent = pck.onboard_email_title;
    if (emailText) emailText.textContent = pck.onboard_email_text;
    if (emailBtn) emailBtn.textContent = pck.onboard_email_button;

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
      if (!LANG_NAMES[code]) return;
      currentLangCode = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      updatePlanAndCreditsUI();
      renderHelpPanelContent(closeHelp);
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
      showOnboardingIfNeeded();
    });
  
