// ========== SABİTLER ==========
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const MAX_FREE_CREDITS = 4;

// Dil kodu -> OpenAI dil adı
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

// Dil -> UI kısa metinleri
const UI_STRINGS = {
  tr: {
    send: "Gönder",
    msgPlaceholder: "Mesaj yaz veya konu gir...",
    topicPlaceholder: "Konu (örn: moda, yemek)",
    watchAd: "Reklam izle +1 puan",
    loading: "Yükleniyor...",
  },
  en: {
    send: "Send",
    msgPlaceholder: "Type a message or topic...",
    topicPlaceholder: "Topic (e.g. fashion, food)",
    watchAd: "Watch ad +1 credit",
    loading: "Loading...",
  },
  es: {
    send: "Enviar",
    msgPlaceholder: "Escribe un mensaje o tema...",
    topicPlaceholder: "Tema (ej: moda, comida)",
    watchAd: "Ver anuncio +1 punto",
    loading: "Cargando...",
  },
  de: {
    send: "Senden",
    msgPlaceholder: "Nachricht oder Thema eingeben...",
    topicPlaceholder: "Thema (z.B. Mode, Essen)",
    watchAd: "Werbung ansehen +1 Punkt",
    loading: "Lädt...",
  },
  fr: {
    send: "Envoyer",
    msgPlaceholder: "Écrire un message ou un sujet...",
    topicPlaceholder: "Sujet (ex : mode, cuisine)",
    watchAd: "Regarder une pub +1 point",
    loading: "Chargement...",
  },
  it: {
    send: "Invia",
    msgPlaceholder: "Scrivi un messaggio o un tema...",
    topicPlaceholder: "Tema (es: moda, cibo)",
    watchAd: "Guarda annuncio +1 punto",
    loading: "Caricamento...",
  },
  pt: {
    send: "Enviar",
    msgPlaceholder: "Digite uma mensagem ou tema...",
    topicPlaceholder: "Tema (ex: moda, comida)",
    watchAd: "Assistir anúncio +1 ponto",
    loading: "Carregando...",
  },
  ru: {
    send: "Отправить",
    msgPlaceholder: "Напишите сообщение или тему...",
    topicPlaceholder: "Тема (напр. мода, еда)",
    watchAd: "Смотреть рекламу +1 балл",
    loading: "Загрузка...",
  },
  ar: {
    send: "إرسال",
    msgPlaceholder: "اكتب رسالة أو موضوع...",
    topicPlaceholder: "الموضوع (مثال: الموضة، الطعام)",
    watchAd: "شاهد إعلانًا +1 نقطة",
    loading: "جار التحميل...",
  },
  fa: {
    send: "ارسال",
    msgPlaceholder: "یک پیام یا موضوع بنویسید...",
    topicPlaceholder: "موضوع (مثلاً مد، غذا)",
    watchAd: "تماشای تبلیغ +۱ امتیاز",
    loading: "در حال بارگذاری...",
  },
  hi: {
    send: "भेजें",
    msgPlaceholder: "संदेश या विषय लिखें...",
    topicPlaceholder: "विषय (जैसे फैशन, फूड)",
    watchAd: "विज्ञापन देखें +1 पॉइंट",
    loading: "लोड हो रहा है...",
  },
  id: {
    send: "Kirim",
    msgPlaceholder: "Tulis pesan atau topik...",
    topicPlaceholder: "Topik (mis: fashion, makanan)",
    watchAd: "Tonton iklan +1 poin",
    loading: "Memuat...",
  },
  ms: {
    send: "Hantar",
    msgPlaceholder: "Tulis mesej atau topik...",
    topicPlaceholder: "Topik (cth: fesyen, makanan)",
    watchAd: "Tonton iklan +1 mata",
    loading: "Memuatkan...",
  },
  th: {
    send: "ส่ง",
    msgPlaceholder: "พิมพ์ข้อความหรือหัวข้อ...",
    topicPlaceholder: "หัวข้อ (เช่น แฟชั่น อาหาร)",
    watchAd: "ดูโฆษณา +1 แต้ม",
    loading: "กำลังโหลด...",
  },
  ja: {
    send: "送信",
    msgPlaceholder: "メッセージまたはトピックを入力...",
    topicPlaceholder: "トピック（例：ファッション、料理）",
    watchAd: "広告を見る +1ポイント",
    loading: "読み込み中...",
  },
  ko: {
    send: "보내기",
    msgPlaceholder: "메시지나 주제를 입력하세요...",
    topicPlaceholder: "주제 (예: 패션, 음식)",
    watchAd: "광고 보기 +1 포인트",
    loading: "불러오는 중...",
  },
  nl: {
    send: "Verzenden",
    msgPlaceholder: "Typ een bericht of onderwerp...",
    topicPlaceholder: "Onderwerp (bijv. mode, eten)",
    watchAd: "Advertentie bekijken +1 punt",
    loading: "Laden...",
  },
  sv: {
    send: "Skicka",
    msgPlaceholder: "Skriv ett meddelande eller ämne...",
    topicPlaceholder: "Ämne (t.ex. mode, mat)",
    watchAd: "Titta på annons +1 poäng",
    loading: "Laddar...",
  },
  no: {
    send: "Send",
    msgPlaceholder: "Skriv en melding eller et tema...",
    topicPlaceholder: "Tema (f.eks. mote, mat)",
    watchAd: "Se annonse +1 poeng",
    loading: "Laster...",
  },
  da: {
    send: "Send",
    msgPlaceholder: "Skriv en besked eller et emne...",
    topicPlaceholder: "Emne (f.eks. mode, mad)",
    watchAd: "Se reklame +1 point",
    loading: "Indlæser...",
  },
  pl: {
    send: "Wyślij",
    msgPlaceholder: "Wpisz wiadomość lub temat...",
    topicPlaceholder: "Temat (np. moda, jedzenie)",
    watchAd: "Obejrzyj reklamę +1 punkt",
    loading: "Ładowanie...",
  },
};

// Dil kodu -> arayüz etiketi
const LANG_LABELS = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  fa: "فارسی",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  sv: "Svenska",
  no: "Norsk",
  da: "Dansk",
  pl: "Polski",
};

// Global durum
let conversations = [];
let currentId = null;
let currentPlan = "free"; // "free" | "pro"
let credits = MAX_FREE_CREDITS;
let currentLangCode = localStorage.getItem(LANG_KEY) || "tr";
let currentEmail = "";

// ========== DURUM YÜKLE / KAYDET ==========

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) conversations = JSON.parse(raw);
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

// ========== YARDIMCI ==========
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
    conv.title = text.slice(0, 40);
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
    creditsLabel.textContent =
      currentPlan === "free"
        ? `Kalan puan: ${credits}/${MAX_FREE_CREDITS}`
        : "Kalan puan: Sınırsız";
  }
  if (watchAdBtn) {
    if (currentPlan === "free") watchAdBtn.classList.remove("hidden");
    else watchAdBtn.classList.add("hidden");
  }
  if (planStatus) {
    planStatus.textContent =
      currentPlan === "pro" ? "Plan: Pro (AKTİF)" : "Plan: Ücretsiz";
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

// UI dilini uygula
function applyLanguageUI() {
  const lang = currentLangCode in UI_STRINGS ? currentLangCode : "en";
  const t = UI_STRINGS[lang];

  const sendBtn = document.getElementById("sendBtn");
  const msgInput = document.getElementById("messageInput");
  const topicInput = document.getElementById("topicInput");
  const watchAdBtn = document.getElementById("watchAdBtn");
  const loadingEl = document.getElementById("loading");

  if (sendBtn) sendBtn.textContent = t.send;
  if (msgInput) msgInput.placeholder = t.msgPlaceholder;
  if (topicInput) topicInput.placeholder = t.topicPlaceholder;
  if (watchAdBtn) watchAdBtn.textContent = t.watchAd;
  if (loadingEl) loadingEl.textContent = t.loading;
}

// ========== API YARDIMCILARI ==========

// Ana sohbet için – burada senin asistan karakterini backend'de güçlendiriyoruz.
async function callIdeasAPI(prompt, platform, langCode) {
  const langName = LANG_NAMES[langCode] || "Turkish";
  try {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        platform,
        lang: langName,
        mode: "assistant_v2", // backend'de istersen buna göre özel prompt kullan
        format: "reel_9_16", // dikey reel mantığı
      }),
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

// Series / Hook / Copy için basit helper
async function callToolAPI(route, payload, loadingEl) {
  try {
    if (loadingEl) loadingEl.classList.remove("hidden");
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data && data.message) return data.message;
    } catch {
      if (text) return text;
    }
    return "Sunucudan anlamlı bir cevap alınamadı.";
  } catch (e) {
    return "Sunucuya bağlanırken hata oluştu.";
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
}

// ========== DOM BAŞLANGIÇ ==========

document.addEventListener("DOMContentLoaded", () => {
  // ---- Elementler ----
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
  const trendsList = document.getElementById("trendsList");

  const voiceBtn = document.getElementById("voiceBtn");
  const cameraBtn = document.getElementById("cameraBtn");

  const panelChat = document.getElementById("panel-chat");
  const panels = document.querySelectorAll(".panel");
  const sideButtons = document.querySelectorAll(".side-btn");

  // Reklam modalı
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

  const seriesTopic = document.getElementById("seriesTopic");
  const seriesGenerate = document.getElementById("seriesGenerate");
  const seriesResult = document.getElementById("seriesResult");

  const hookTopic = document.getElementById("hookTopic");
  const hookGenerate = document.getElementById("hookGenerate");
  const hookResult = document.getElementById("hookResult");

  const copyTopic = document.getElementById("copyTopic");
  const copyGenerate = document.getElementById("copyGenerate");
  const copyResult = document.getElementById("copyResult");

  // ---- Dil seçeneklerini doldur ----
  function fillLanguageSelect(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    Object.keys(LANG_LABELS).forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = LANG_LABELS[code];
      selectEl.appendChild(opt);
    });
    if (currentLangCode && LANG_LABELS[currentLangCode]) {
      selectEl.value = currentLangCode;
    }
  }

  fillLanguageSelect(langSelect);
  fillLanguageSelect(onboardLangSelect);

  // ---- Durumu yükle ----
  loadState();
  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();
  applyLanguageUI();

  // ---- Panel switch (sol paneller) ----
  function showPanel(name) {
    panels.forEach((p) => {
      const targetId = "panel-" + name;
      const isActive = p.id === targetId;
      p.classList.toggle("hidden", !isActive);
    });
  }

  if (panelChat) showPanel("chat");

  sideButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.panel || "chat";
      showPanel(name);
    });
  });

  // ---- TRENDLER ----
  async function loadTrends(langCode) {
    if (!trendsList) return;
    trendsList.innerHTML = "<li>Yükleniyor...</li>";
    const region = (LANG_REGION[langCode] || "US").toUpperCase();
    try {
      const res = await fetch(`/api/trends?region=${encodeURIComponent(region)}`);
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

  loadTrends(currentLangCode);

  const refreshTrendsBtn = document.getElementById("refreshTrendsBtn");
  if (refreshTrendsBtn) {
    refreshTrendsBtn.addEventListener("click", () => {
      loadTrends(currentLangCode);
    });
  }

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

  // ---- Reklam modalı ----
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
      credits = Math.min(credits + 1, 50); // günlük 50 reklam limiti gibi düşünebilirsin
      saveCredits();
      updatePlanAndCreditsUI();
      closeAdModal();
    });
  }
  if (adCloseIcon && adStepMain && 
