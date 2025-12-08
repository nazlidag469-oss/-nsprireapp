// === LOCAL STORAGE KEYLERİ ===
const STORAGE_KEY = "inspireapp_conversations_v1";
const CREDITS_KEY = "inspireapp_credits_v1";
const PLAN_KEY = "inspireapp_plan_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const PASSWORD_KEY = "inspireapp_password_v1";
const LANG_KEY = "inspireapp_lang_v1";

const AD_COUNT_KEY = "inspireapp_daily_ad_count_v1";
const AD_DATE_KEY = "inspireapp_daily_ad_date_v1";

const MAX_FREE_CREDITS = 4;
const DAILY_AD_LIMIT = 400;

// === DİL TABLOLARI ===
const LANG_NAMES = { tr: "Turkish", en: "English" };
const LANG_REGION = { tr: "TR", en: "US" };

// === GLOBAL STATE ===
const state = {
  conversations: [],
  currentId: null,
  plan: "free",
  credits: MAX_FREE_CREDITS,
  lang: "tr",
  email: "",
  password: "",
};


// ------------------------------------------------------
// 🔐 LOGIN KONTROLÜ (ŞİFRELİ GİRİŞ) – YENİ EKLENEN BÖLÜM
// ------------------------------------------------------
async function tryLogin(email, password) {
  try {
    const res = await fetch("/api/login-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.message || "Giriş yapılamadı." };
    }

    // Giriş başarılı
    return {
      ok: true,
      user: data.user,
    };
  } catch (err) {
    return { ok: false, message: "Sunucu hatası." };
  }
}


// ----------------------------------------------
// STATE YÜKLE / KAYDET
// ----------------------------------------------
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

  const pw = localStorage.getItem(PASSWORD_KEY);
  if (pw) state.password = pw;
}

function saveEmail() {
  if (state.email) localStorage.setItem(EMAIL_KEY, state.email);
}

function savePassword() {
  if (state.password) localStorage.setItem(PASSWORD_KEY, state.password);
}

function saveCredits() {
  localStorage.setItem(CREDITS_KEY, String(state.credits));
}

function savePlan() {
  localStorage.setItem(PLAN_KEY, state.plan);
}

function saveConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations));
}


// ------------------------------------------------------
// 🟣 UYGULAMA YÜKLENDİĞİNDE – ONBOARDING + LOGIN AKIŞI
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  const onboardingOverlay = document.getElementById("onboardingOverlay");
  const onboardStepLang = document.getElementById("onboardStepLang");
  const onboardStepEmail = document.getElementById("onboardStepEmail");
  const onboardLangSelect = document.getElementById("onboardLangSelect");
  const onboardLangSaveBtn = document.getElementById("onboardLangSaveBtn");
  const onboardEmailInput = document.getElementById("onboardEmailInput");
  const onboardPasswordInput = document.getElementById("onboardPasswordInput");
  const onboardEmailSaveBtn = document.getElementById("onboardEmailSaveBtn");

  // Dil menülerini doldur
  onboardLangSelect.innerHTML = `
    <option value="tr">Türkçe</option>
    <option value="en">English</option>
  `;
  onboardLangSelect.value = state.lang;


  // ----------------------------------------
  // Eğer email + şifre kayıtlı değilse LOGIN zorunlu
  // ----------------------------------------
  const hasLang = !!localStorage.getItem(LANG_KEY);
  const hasEmail = !!localStorage.getItem(EMAIL_KEY);
  const hasPassword = !!localStorage.getItem(PASSWORD_KEY);

  if (!hasLang || !hasEmail || !hasPassword) {
    onboardingOverlay.classList.remove("hidden");
    onboardStepLang.classList.toggle("hidden", hasLang);
    onboardStepEmail.classList.toggle("hidden", !hasLang);
  }


  // -----------------------------
  // DİL SEÇİLDİ – EMAIL ADIMINA GEÇ
  // -----------------------------
  onboardLangSaveBtn.addEventListener("click", () => {
    const lang = onboardLangSelect.value || "tr";
    state.lang = lang;
    localStorage.setItem(LANG_KEY, lang);

    onboardStepLang.classList.add("hidden");
    onboardStepEmail.classList.remove("hidden");
  });


  // -----------------------------
  // E-POSTA + ŞİFRE → LOGIN OR REGISTER
  // -----------------------------
  onboardEmailSaveBtn.addEventListener("click", async () => {
    const email = onboardEmailInput.value.trim();
    const password = onboardPasswordInput.value.trim();

    if (!email || !password) {
      alert("E-posta ve şifre zorunludur.");
      return;
    }

    // Supabase login denemesi
    const login = await tryLogin(email, password);

    if (!login.ok) {
      //
      // Kullanıcı yok → otomatik kayıt
      //
      await fetch("/api/register-user", {
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

      alert("Kayıt oluşturuldu. Giriş yapıldı.");
    }

    // Local'e kaydet
    state.email = email;
    state.password = password;
    saveEmail();
    savePassword();

    onboardingOverlay.classList.add("hidden");
  });

});// === ONBOARDING EMAIL + PASSWORD KAYDETME ===
if (onboardEmailSaveBtn && onboardEmailInput) {
  onboardEmailSaveBtn.addEventListener("click", async () => {
    const t = I18N[state.lang] || I18N.tr;

    const email = onboardEmailInput.value.trim();
    const password = onboardPasswordInput.value.trim();

    if (!email) {
      alert(t.emailNotSavedAlert);
      return;
    }
    if (!password || password.length < 6) {
      alert("Şifre en az 6 karakter olmalı!");
      return;
    }

    // Local state'e kaydet
    state.email = email;
    saveEmail();
    updateAccountEmailUI();

    // 🔥 API'ye gönder — kullanıcıyı Supabase USERS tablosuna kaydet
    try {
      await fetch("/api/register-user", {
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
    } catch (e) {
      console.error("register-user hatası:", e);
    }

    onboardingOverlay.classList.add("hidden");
  });
}if (chatForm && topicInput && platformSelect && messageInput && loadingEl) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = I18N[state.lang] || I18N.tr;

      const topic = (topicInput.value || "").trim();
      const extra = (messageInput.value || "").trim();
      const platform = platformSelect.value || "tiktok";
      const prompt = extra ? `${topic}\n\n${extra}` : topic;

      if (!prompt) return;

      if (state.plan === "free" && state.credits <= 0) {
        alert(t.freeNoCreditsAlert);
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
