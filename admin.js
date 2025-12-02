// admin.js
// InspireApp Admin Paneli – HTML + JS sürümü
// Supabase'ten kullanıcıları çeker ve tabloya basar.

const state = {
  rawUsers: [],
  filteredUsers: [],
};

function $(id) {
  return document.getElementById(id);
}

function setAdminMessage(text, type = "") {
  const el = $("adminMessage");
  if (!el) return;
  el.textContent = text || "";
  el.classList.remove("error", "success");
  if (type) el.classList.add(type);
}

function renderUsers() {
  const tbody = $("usersTableBody");
  const countEl = $("userCount");
  if (!tbody) return;

  tbody.innerHTML = "";

  const list = state.filteredUsers.length
    ? state.filteredUsers
    : state.rawUsers;

  if (!list.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = "Kayıtlı kullanıcı bulunamadı.";
    td.className = "muted";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    list.forEach((u) => {
      const tr = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = u.id || u.user_id || "-";
      tr.appendChild(idCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = u.email || u.user_email || "-";
      tr.appendChild(emailCell);

      const planCell = document.createElement("td");
      const plan = (u.plan || u.subscription_plan || "free").toLowerCase();
      const span = document.createElement("span");
      if (plan === "pro") {
        span.className = "badge-pro";
        span.textContent = "PRO";
      } else {
        span.className = "badge-free";
        span.textContent = "FREE";
      }
      planCell.appendChild(span);
      tr.appendChild(planCell);

      const creditsCell = document.createElement("td");
      creditsCell.textContent =
        u.credits != null
          ? String(u.credits)
          : u.remaining_credits != null
          ? String(u.remaining_credits)
          : "-";
      tr.appendChild(creditsCell);

      const createdCell = document.createElement("td");
      const rawDate =
        u.created_at || u.createdAt || u.signup_at || u.inserted_at;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          createdCell.textContent = d.toLocaleString("tr-TR");
        } catch {
          createdCell.textContent = rawDate;
        }
      } else {
        createdCell.textContent = "-";
      }
      tr.appendChild(createdCell);

      tbody.appendChild(tr);
    });
  }

  if (countEl) {
    const total = state.rawUsers.length;
    const shown = list.length;
    if (!total) countEl.textContent = "";
    else if (shown === total) countEl.textContent = `· ${total} kullanıcı`;
    else countEl.textContent = `· ${shown}/${total} kullanıcı`;
  }
}

async function fetchUsers() {
  setAdminMessage("Kullanıcı listesi yükleniyor...", "");
  state.rawUsers = [];
  state.filteredUsers = [];
  renderUsers();

  try {
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        `Sunucu hata kodu: ${res.status}`;
      const detail = data && (data.detail || data.error_description);
      setAdminMessage(
        detail ? `Sunucu hatası: ${msg} (${detail})` : `Sunucu hatası: ${msg}`,
        "error"
      );
      return;
    }

    const users = (data && data.users) || [];
    state.rawUsers = Array.isArray(users) ? users : [];
    state.filteredUsers = [];
    renderUsers();

    setAdminMessage(
      `Kullanıcı listesi başarıyla yüklendi. (${state.rawUsers.length} kayıt)`,
      "success"
    );
  } catch (e) {
    console.error("ADMIN_FETCH_ERROR", e);
    setAdminMessage(
      "Sunucuya bağlanırken beklenmeyen bir hata oluştu.",
      "error"
    );
  }
}

function setupSearch() {
  const searchInput = $("userSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      state.filteredUsers = [];
      renderUsers();
      return;
    }

    state.filteredUsers = state.rawUsers.filter((u) => {
      const id = (u.id || u.user_id || "").toString().toLowerCase();
      const email = (u.email || u.user_email || "").toLowerCase();
      const plan = (u.plan || u.subscription_plan || "").toLowerCase();
      return (
        id.includes(q) || email.includes(q) || plan.includes(q)
      );
    });
    renderUsers();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = $("adminLoginBtn");
  const passInput = $("adminPassword");

  if (btn) {
    btn.addEventListener("click", () => {
      // Şimdilik şifre kontrolü yok. İstersen buraya sabit şifre koyabiliriz.
      // Örn: if (passInput.value !== "MEHMET-SUPER-ADMIN") { ... }

      fetchUsers();
    });
  }

  setupSearch();
  renderUsers();
});
