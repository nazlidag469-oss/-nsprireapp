// /admin.js
// Basit GLOBAL ADMIN PANEL:
//  - Frontend şifre kontrolü
//  - /api/admin-users'tan kullanıcı listesi çekme
//  - Üstte istatistik, altta tablo + bar chart

const FRONTEND_ADMIN_PASSWORD = "Aslaunutmam.1"; // sadece sen bileceksin

document.addEventListener("DOMContentLoaded", () => {
  const pwInput = document.getElementById("adminPasswordInput");
  const loginBtn = document.getElementById("adminLoginBtn");
  const msgEl = document.getElementById("adminMessage");
  const loginSection = document.getElementById("loginSection");
  const adminPanel = document.getElementById("adminPanel");
  const usersBody = document.getElementById("adminUsersBody");
  const adminInfo = document.getElementById("adminInfo");
  const reloadBtn = document.getElementById("reloadBtn");

  const statTotal = document.getElementById("statTotal");
  const statPro = document.getElementById("statPro");
  const statFree = document.getElementById("statFree");
  const statToday = document.getElementById("statToday");

  let chartInstance = null;

  function setMessage(text, type = "info") {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color =
      type === "error"
        ? "#f97373"
        : type === "success"
        ? "#4ade80"
        : "#e5e7eb";
  }

  function setInfo(text) {
    if (adminInfo) adminInfo.textContent = text;
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleString("tr-TR");
    } catch {
      return String(value);
    }
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function renderStats(users) {
    const total = users.length;
    const proCount = users.filter((u) => u.plan === "pro").length;
    const freeCount = total - proCount;

    const todayStr = todayISO();
    const todayCount = users.filter((u) => {
      if (!u.created_at) return false;
      return String(u.created_at).startsWith(todayStr);
    }).length;

    if (statTotal) statTotal.textContent = String(total);
    if (statPro) statPro.textContent = String(proCount);
    if (statFree) statFree.textContent = String(freeCount);
    if (statToday) statToday.textContent = String(todayCount);

    // Grafik çiz
    const ctx = document.getElementById("usersChart");
    if (!ctx) return;

    const data = {
      labels: ["Ücretsiz", "PRO"],
      datasets: [
        {
          label: "Kullanıcı sayısı",
          data: [freeCount, proCount],
          backgroundColor: ["#4b5563", "#22c55e"],
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e5e7eb" } },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(31,41,55,0.6)" },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(31,41,55,0.6)" },
        },
      },
    };

    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
      type: "bar",
      data,
      options,
    });
  }

  function renderTable(users) {
    if (!usersBody) return;
    usersBody.innerHTML = "";

    if (!users.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 8;
      td.textContent = "Henüz kullanıcı yok.";
      usersBody.appendChild(tr);
      tr.appendChild(td);
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");

      function td(v) {
        const cell = document.createElement("td");
        cell.textContent = v == null ? "" : String(v);
        return cell;
      }

      tr.appendChild(td(u.id || ""));
      tr.appendChild(td(formatDate(u.created_at)));
      tr.appendChild(td(u.email || "—"));

      const planTd = document.createElement("td");
      const planTag = document.createElement("span");
      planTag.classList.add("tag");
      if (u.plan === "pro") {
        planTag.classList.add("pro");
        planTag.textContent = "PRO";
      } else {
        planTag.classList.add("free");
        planTag.textContent = "Free";
      }
      planTd.appendChild(planTag);
      tr.appendChild(planTd);

      tr.appendChild(td(u.lang || "tr"));
      tr.appendChild(td(u.credits ?? 0));
      tr.appendChild(td(u.ad_count ?? 0));
      tr.appendChild(td(u.last_ad_date || "—"));

      usersBody.appendChild(tr);
    });
  }

  async function loadUsers() {
    setInfo("Kullanıcı listesi yükleniyor...");
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Şimdilik backend'e şifre göndermiyoruz, sadece Supabase'ten okuyan endpoint
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("admin-users hata:", res.status, data);
        setInfo("Sunucu hatası: kullanıcı listesi alınamadı.");
        setMessage(
          (data && data.message) || "Sunucu hatası oluştu.",
          "error"
        );
        return;
      }

      const users =
        (data && Array.isArray(data.users) && data.users) ||
        (Array.isArray(data) ? data : []);

      setInfo(`Toplam ${users.length} kullanıcı yüklendi.`);
      setMessage("Veriler yüklendi.", "success");

      renderStats(users);
      renderTable(users);
    } catch (err) {
      console.error("Admin panel istek hatası:", err);
      setInfo("Bağlantı hatası.");
      setMessage("Bağlantı hatası, biraz sonra tekrar dene.", "error");
    }
  }

  // Giriş butonu
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const val = (pwInput && pwInput.value.trim()) || "";
      if (!val) {
        setMessage("Şifre gir.", "error");
        return;
      }
      if (val !== FRONTEND_ADMIN_PASSWORD) {
        setMessage("Şifre yanlış.", "error");
        return;
      }

      setMessage("Giriş başarılı.", "success");
      if (loginSection) loginSection.classList.add("hidden");
      if (adminPanel) adminPanel.classList.remove("hidden");

      loadUsers();
    });
  }

  // Yenile butonu
  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      loadUsers();
    });
  }
});
