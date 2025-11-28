const ADMIN_PASSWORD = "Aslaunutmam.1";

document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("loginBox");
  const adminContent = document.getElementById("adminContent");
  const pwInput = document.getElementById("adminPasswordInput");
  const loginBtn = document.getElementById("adminLoginBtn");
  const errorEl = document.getElementById("adminError");
  const conversationsDump = document.getElementById("conversationsDump");
  const userInfo = document.getElementById("userInfo");

  loginBtn.addEventListener("click", () => {
    const value = pwInput.value;
    if (value === ADMIN_PASSWORD) {
      loginBox.classList.add("hidden");
      adminContent.classList.remove("hidden");

      const conv = localStorage.getItem("inspireapp_conversations_v1");
      conversationsDump.textContent = conv || "Bu cihazda sohbet yok.";

      const email = localStorage.getItem("inspireapp_email") || "(yok)";
      const plan = localStorage.getItem("inspireapp_plan") || "(yok)";
      userInfo.textContent = `E-posta: ${email} | Plan: ${plan}`;
    } else {
      errorEl.textContent = "Yanlış şifre.";
    }
  });
});