// Bu dosya sadece admin paneli için.
// Şifre kontrolü backend'de (/api/admin-users) yapılıyor.

const STORAGE_KEY = "inspireapp_conversations_v1";
const EMAIL_KEY = "inspireapp_email_v1";
const PLAN_KEY = "inspireapp_plan_v1";

document.addEventListener("DOMContentLoaded", () => {
  const loginBox = document.getElementById("loginBox");
  const adminContent = document.getElementById("adminContent");
  const pwInput = document.getElementById("adminPasswordInput");
  const loginBtn = document.getElementById("adminLoginBtn");
  const errorEl = document.getElementById("adminError");

  const summaryText = document.getElementById("summaryText");
  const usersTableBody = document.querySelector("#usersTable tbody");
  const conversationsDump = document.getElementById("conversationsDump");
  const deviceUserInfo = document.getElementById("deviceUserInfo");

  // Cihazdaki localStorage özetini doldur
  function fillDeviceInfo() {
    try {
      const conv = localStorage.getItem(STORAGE_KEY);
      conversationsDump.textContent =
        conv || "Bu cihazda kayıtlı sohbet bulunamadı.";

      const email = localStorage.getItem(EMAIL_KEY) || "(kayıtlı değil)";
      const plan = localStorage.getItem(PLAN_KEY) || "(bilinmiyor)";
      deviceUserInfo.textContent = `Bu cihaz → E-posta: ${email} | Plan: ${plan}`;
    } catch (e) {
      conversationsDump.textContent =
        "LocalStorage okunurken hata oluştu: " + e.message;
    }
  }

  // Supabase'ten gelen kullanıcı listesini tabloya bas
  function renderUsersTable(users) {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = "";

    if (!users || !users.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 8;
      td.textContent = "Henüz Supabase'te kullanıcı yok.";
      tr.appendChild(td);
      usersTableBody.appendChild(tr);
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");

      function tdText(txt) {
        const td = document.createElement("td");
        td.textContent = txt == null ? "" : String(txt);
        return td;
      }

      tr.appendChild(tdText(u.id));
      tr.appendChild(tdText(u.email));
      tr.appendChild(tdText(u.plan));
      tr.appendChild(tdText(u.lang));
      tr.appendChild(tdText(u.credits));
      tr.appendChild(tdText(u.ad_count));
      tr.appendChild(tdText(u.last_ad_date));
      tr.appendChild(tdText(u.created_at));

      usersTableBody.appendChild(tr);
    });
  }

  // Supabase özet metni
  function renderSummary(summary) {
    if (!summaryText) return;

    if (!summary) {
      summaryText.textContent = "Supabase'ten özet alınamadı.";
      return;
    }

    const {
      totalUsers,
      proCount,
      freeCount,
      totalCredits,
      avgCredits,
    } = summary;

    summaryText.textContent =
      `Toplam kullanıcı: ${totalUsers} | ` +
      `PRO: ${proCount} | ` +
      `Free: ${freeCount} | ` +
      `Toplam krediler: ${totalCredits} | ` +
      `Ortalama kredi: ${avgCredits.toFixed ? avgCredits.toFixed(2) : avgCredits}`;
  }

  async function doLogin() {
    const pw = (pwInput.value || "").trim();
    errorEl.textContent = "";

    if (!pw) {
      errorEl.textContent = "Lütfen şifreyi gir.";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Kontrol ediliyor...";

    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.ok) {
        const msg =
          (data && data.message) ||
          "Giriş başarısız. Şifreyi kontrol et.";
        throw new Error(msg);
      }

      // Başarılı giriş
      loginBox.classList.add("hidden");
      adminContent.classList.remove("hidden");

      renderSummary(data.summary);
      renderUsersTable(data.users || []);
      fillDeviceInfo();
    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message || "Beklenmeyen bir hata oluştu.";
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Giriş";
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", doLogin);
  }
  if (pwInput) {
    pwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doLogin();
      }
    });
  }
});
