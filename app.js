const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const LANG_KEY = "inspireapp_lang_v1";

const MAX_FREE_CREDITS = 4;
const DAILY_AD_LIMIT = 200;
const AD_COUNT_KEY = "inspireapp_daily_ad_count_v1";
const AD_DATE_KEY = "inspireapp_daily_ad_date_v1";

const LANG_NAMES = {
  tr: "Turkish", en: "English", es: "Spanish", de: "German", fr: "French",
  it: "Italian", pt: "Portuguese", ru: "Russian", ar: "Arabic", fa: "Persian",
  hi: "Hindi", id: "Indonesian", ms: "Malay", th: "Thai", ja: "Japanese",
  ko: "Korean", nl: "Dutch", sv: "Swedish", no: "Norwegian", da: "Danish",
  pl: "Polish",
};

const LANG_REGION = {
  tr: "TR", en: "US", es: "ES", de: "DE", fr: "FR", it: "IT", pt: "BR",
  ru: "RU", ar: "SA", fa: "IR", hi: "IN", id: "ID", ms: "MY", th: "TH",
  ja: "JP", ko: "KR", nl: "NL", sv: "SE", no: "NO", da: "DK", pl: "PL",
};

const UI_TEXT = {
  tr: { send: "Gönder", ad: "Reklam izle +1 puan", placeholder: "Mesaj yaz veya konu gir..." },
  en: { send: "Send", ad: "Watch Ad +1 credit", placeholder: "Type a message or topic..." },
};

const state = {
  conversations: [],
  currentId: null,
  plan: "free",
  credits: MAX_FREE_CREDITS,
  lang: "tr",
  email: "",
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.conversations = JSON.parse(raw);
  } catch {
    state.conversations = [];
  }
  if (!state.conversations.length) {
    const first = {
      id: Date.now().toString(),
      title: "Yeni sohbet",
      messages: [],
      createdAt: Date.now(),
    };
    state.conversations.push(first);
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

function renderConversationList() {
  const listEl = document.getElementById("conversationList");
  if (!listEl) return;
  listEl.innerHTML = "";
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
        if (!confirm("Bu sohbeti silmek istiyor musun?")) return;
        state.conversations = state.conversations.filter((c) => c.id !== conv.id);
        if (!state.conversations.length) {
          const first = {
            id: Date.now().toString(),
            title: "Yeni sohbet",
            messages: [],
            createdAt: Date.now(),
          };
          state.conversations.push(first);
        }
        state.currentId = state.conversations[0].id;
        saveConversations();
        renderConversationList();
        renderMessages();
      });

      listEl.appendChild(item);
    });
}

function renderMessages() {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const conv = currentConv();
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
  const conv = currentConv();
  conv.messages.push({ role, text });
  if (!conv.title || conv.title === "Yeni sohbet") {
    const firstUserMsg = conv.messages.find((m) => m.role === "user");
    if (firstUserMsg?.text) conv.title = buildTitleFromText(firstUserMsg.text);
  }
  saveConversations();
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
      state.plan === "pro" ? "Plan: Pro (sınırsız puan)" : "Plan: Ücretsiz";
  }
  if (creditsLabel) {
    creditsLabel.textContent =
      state.plan === "free"
        ? `Kalan puan: ${state.credits}/${MAX_FREE_CREDITS}`
        : "Kalan puan: Sınırsız";
  }
  if (watchAdBtn) {
    watchAdBtn.classList.toggle("hidden", state.plan !== "free");
  }
  if (planStatus) {
    planStatus.textContent =
      state.plan === "pro" ? "Plan: Pro (aktif)" : "Plan: Ücretsiz";
  }
  if (subscribeBlock) {
    subscribeBlock.classList.toggle("hidden", state.plan === "pro");
  }
}

function updateAccountEmailUI() {
  const el = document.getElementById("accountEmail");
  if (el) el.textContent = state.email || "Kayıtlı değil";
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

function fillLangSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  Object.keys(LANG_NAMES).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent =
      code === "tr" ? "Türkçe" : code === "en" ? "English" : LANG_NAMES[code];
    selectEl.appendChild(opt);
  });
  selectEl.value = state.lang;
}

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
      if (data?.message) return data.message;
    } catch {
      if (text) return text;
    }
    return "API'den anlamlı bir cevap alınamadı.";
  } catch {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function callSimpleAPI(route, payload) {
  try {
    const res = await fetch(`/api/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return data?.message || "Sunucudan anlamlı bir cevap alınamadı.";
  } catch {
    return "Sunucuya bağlanırken bir hata oluştu.";
  }
}

async function loadTrends() {
  const list = document.getElementById("trendsList");
  if (!list) return;
  const region = (LANG_REGION[state.lang] || "US").toUpperCase();
  list.innerHTML = "<li>Yükleniyor...</li>";
  try {
    const res = await fetch(`/api/trends?region=${region}`);
    const data = await res.json();
    if (!res.ok) {
      list.innerHTML =
        "<li>Trendler alınırken hata: " + (data.message || "") + "</li>";
      return;
    }
    if (!data.items?.length) {
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

window.__setProPlanFromAndroid = function () {
  state.plan = "pro";
  savePlan();
  updatePlanAndCreditsUI();
  alert("🎉 PRO üyelik Google Play üzerinden başarıyla aktif edildi!");
};

document.addEventListener("DOMContentLoaded", () => {
  loadState();

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
  const cameraFileInput = document.getElementById("cameraFileInput");

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

  fillLangSelect(langSelect);
  fillLangSelect(onboardLangSelect);

  renderConversationList();
  renderMessages();
  updatePlanAndCreditsUI();
  updateAccountEmailUI();
  applyUITextForLang(state.lang);
  loadTrends();

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

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const conv = {
        id: Date.now().toString(),
        title: "Yeni sohbet",
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

  function openAdModal() {
    if (!modalBackdrop || !adModal) return;
    adStepMain?.classList.remove("hidden");
    adStepConfirm?.classList.add("hidden");
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
      if (state.plan !== "free") return;
      openAdModal();
    });
  }
  if (adCancelBtn) adCancelBtn.addEventListener("click", closeAdModal);

  if (adWatchedBtn) {
    adWatchedBtn.addEventListener("click", () => {
      const today = new Date().toISOString().slice(0, 10);
      const storedDate = localStorage.getItem(AD_DATE_KEY);
      let storedCount = parseInt(localStorage.getItem(AD_COUNT_KEY) || "0", 10);
      if (storedDate !== today) storedCount = 0;
      if (storedCount >= DAILY_AD_LIMIT) {
        alert(`Günlük reklam limiti doldu. (Limit: ${DAILY_AD_LIMIT})`);
        closeAdModal();
        return;
      }
      storedCount += 1;
      localStorage.setItem(AD_DATE_KEY, today);
      localStorage.setItem(AD_COUNT_KEY, String(storedCount));
      state.credits += 1;
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
  if (adConfirmCloseBtn) adConfirmCloseBtn.addEventListener("click", closeAdModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeAdModal);

  if (onboardLangSaveBtn && onboardLangSelect) {
    onboardLangSaveBtn.addEventListener("click", () => {
      const code = onboardLangSelect.value || "tr";
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      if (langSelect) langSelect.value = code;
      applyUITextForLang(code);
      loadTrends();
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
    });
  }

  if (onboardEmailSaveBtn && onboardEmailInput) {
    onboardEmailSaveBtn.addEventListener("click", () => {
      const email = onboardEmailInput.value.trim();
      if (!email) return;
      state.email = email;
      saveEmail();
      updateAccountEmailUI();
      onboardingOverlay.classList.add("hidden");
    });
  }

  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      if (!onboardingOverlay) return;
      onboardStepLang.classList.add("hidden");
      onboardStepEmail.classList.remove("hidden");
      onboardingOverlay.classList.remove("hidden");
    });
  }

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      if (window.AndroidBilling?.startPurchase) {
        const sku = state.lang === "tr" ? "pro_monthly_tr" : "pro_monthly_intl";
        window.AndroidBilling.startPurchase(sku);
        return;
      }
      alert(
        "PRO üyelik, Google Play içi satın alma ile açılacak.\nBu web demo sürümünde gerçek ödeme aktif değil."
      );
    });
  }

  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const code = langSelect.value;
      if (!LANG_NAMES[code]) return;
      state.lang = code;
      localStorage.setItem(LANG_KEY, code);
      applyUITextForLang(code);
      loadTrends();
    });
  }

  document.querySelectorAll(".side-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.panel;
      document
        .querySelectorAll("main .panel")
        .forEach((sec) => sec.classList.add("hidden"));
      const active = document.getElementById(`panel-${target}`);
      if (active) active.classList.remove("hidden");
      if (sidebar) sidebar.classList.add("hidden");
    });
  });

  // 🎤 SES – Web Speech API ile konuşmayı metne çevir
  let recognition = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = state.lang === "tr" ? "tr-TR" : "en-US";
    recognition.interimResults = false;
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!recognition) {
        alert("Bu tarayıcıda ses tanıma desteklenmiyor. (Chrome önerilir)");
        return;
      }
      try {
        recognition.start();
      } catch (e) {
        // üst üste start atılırsa hata verebilir, yok sayıyoruz
      }
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎤…";

      recognition.onresult = (ev) => {
        const text = ev.results?.[0]?.[0]?.transcript || "";
        if (messageInput && text) {
          messageInput.value = (messageInput.value + " " + text).trim();
        }
      };
      recognition.onerror = () => {
        alert("Ses tanıma sırasında bir hata oldu.");
      };
      recognition.onend = () => {
        voiceBtn.disabled = false;
        voiceBtn.textContent = "🎤";
      };
    });
  }

  // 📷 KAMERA – dosya seçtir (foto/video) ve adı mesaj alanına yaz
  if (cameraBtn && cameraFileInput) {
    cameraBtn.addEventListener("click", () => {
      cameraFileInput.click();
    });

    cameraFileInput.addEventListener("change", () => {
      const file = cameraFileInput.files?.[0];
      if (!file) return;
      const info = `[DOSYA: ${file.name}]`;
      if (messageInput) {
        messageInput.value = messageInput.value
          ? messageInput.value + " " + info
          : info;
      }
    });
  }

  if (refreshTrendsBtn) {
    refreshTrendsBtn.addEventListener("click", () => loadTrends());
  }

  if (seriesGenerate && seriesTopic && seriesResult) {
    seriesGenerate.addEventListener("click", async () => {
      const topic = seriesTopic.value.trim();
      if (!topic) return;
      seriesResult.textContent = "Yükleniyor...";
      const text = await callSimpleAPI("series", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      seriesResult.textContent = text;
    });
  }

  if (hookGenerate && hookTopic && hookResult) {
    hookGenerate.addEventListener("click", async () => {
      const topic = hookTopic.value.trim();
      if (!topic) return;
      hookResult.textContent = "Yükleniyor...";
      const text = await callSimpleAPI("hook", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      hookResult.textContent = text;
    });
  }

  if (copyGenerate && copyTopic && copyResult) {
    copyGenerate.addEventListener("click", async () => {
      const topic = copyTopic.value.trim();
      if (!topic) return;
      copyResult.textContent = "Yükleniyor...";
      const text = await callSimpleAPI("copy", {
        topic,
        lang: LANG_NAMES[state.lang] || "Turkish",
      });
      copyResult.textContent = text;
    });
  }

  if (chatForm && topicInput && platformSelect && messageInput && loadingEl) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const topic = (topicInput.value || "").trim();
      const extra = (messageInput.value || "").trim();
      const platform = platformSelect.value || "tiktok";
      const prompt = extra ? `${topic}\n\n${extra}` : topic;
      if (!prompt) return;

      if (state.plan === "free" && state.credits <= 0) {
        alert("Ücretsiz planda kredi bitti. Reklam izleyerek +1 alabilirsin.");
        return;
      }

      addMessage("user", prompt);
      loadingEl.classList.remove("hidden");

      const reply = await callIdeasAPI(prompt, platform, state.lang);

      addMessage("assistant", reply);
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
