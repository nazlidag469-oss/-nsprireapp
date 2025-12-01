// Basit admin şifresi (frontend'de gömülü, sadece kendi kullanımın için)
// İstediğin zaman değiştir:
// Örn: const ADMIN_PASSWORD = "BenBileUnuturum_2025!";
const ADMIN_PASSWORD = "Aslaunutmam.1";

document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("loginBox");
  const adminContent = document.getElementById("adminContent");
  const pwInput = document.getElementById("adminPasswordInput");
  const loginBtn = document.getElementById("adminLoginBtn");
  const errorEl = document.getElementById("adminError");

  const conversationsDump = document.getElementById("conversationsDump");
  const userInfo = document.getElementById("userInfo");
  const allKeysDump = document.getElementById("allKeysDump");

  function prettyJson(raw) {
    if (!raw) return "";
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  function loadAdminData() {
    // Sohbetler
    const convRaw = localStorage.getItem("inspireapp_conversations_v1");
    conversationsDump.textContent = convRaw
      ? prettyJson(convRaw)
      : "Bu cihazda kayıtlı sohbet yok.";

    // Kullanıcı bilgileri
    const email = localStorage.getItem("inspireapp_email_v1") || "(yok)";
    const plan = localStorage.getItem("inspireapp_plan_v1") || "(yok)";
    const credits = localStorage.getItem("inspireapp_credits_v1") || "(yok)";
    const lang = localStorage.getItem("inspireapp_lang_v1") || "(yok)";

    userInfo.textContent =
      `E-posta: ${email} | Plan: ${plan} | Kredi: ${credits} | Dil: ${lang}`;

    // İlgili tüm key'leri topluca göster
    const all = {
      inspireapp_conversations_v1: convRaw || null,
      inspireapp_email_v1: email,
      inspireapp_plan_v1: plan,
      inspireapp_credits_v1: credits,
      inspireapp_lang_v1: lang,
    };
    allKeysDump.textContent = JSON.stringify(all, null, 2);
  }

  loginBtn.addEventListener("click", () => {
    const value = pwInput.value;
    if (value === ADMIN_PASSWORD) {
      errorEl.textContent = "";
      loginBox.classList.add("hidden");
      adminContent.classList.remove("hidden");
      loadAdminData();
    } else {
      errorEl.textContent = "Yanlış şifre.";
    }
  });

  // Enter ile login
  pwInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
});
