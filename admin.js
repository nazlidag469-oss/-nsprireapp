// admin.js — ŞİFRE KONTROLÜ YOK, GİRİŞ BUTONUNA TIKLA → KULLANICI LİSTESİ

document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('adminPasswordInput');
  const loginBtn = document.getElementById('adminLoginBtn');
  const msgEl = document.getElementById('adminMessage');
  const loginSection = document.getElementById('loginSection');
  const adminPanel = document.getElementById('adminPanel');
  const usersBody = document.getElementById('adminUsersBody');

  if (!loginBtn || !adminPanel || !usersBody) {
    console.error('Admin panel elementleri bulunamadı.');
    return;
  }

  function setMessage(text, type = 'info') {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.style.color =
      type === 'error' ? '#e11d48' : type === 'success' ? '#16a34a' : '#111827';
  }

  async function loadUsers() {
    setMessage('Kullanıcı listesi yükleniyor...', 'info');
    loginBtn.disabled = true;

    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.error('JSON parse hatası:', err);
      }

      if (!res.ok) {
        console.error('API hata', res.status, data);
        setMessage(data.message || 'Sunucu hatası: kullanıcı listesi alınamadı.', 'error');
        return;
      }

      if (!data || !Array.isArray(data.users)) {
        console.error('Beklenmeyen yanıt /api/admin-users:', data);
        setMessage('Sunucu hatası: geçersiz cevap.', 'error');
        return;
      }

      // Giriş başarılı → login bölümü gizle, paneli göster
      if (loginSection) loginSection.classList.add('hidden');
      adminPanel.classList.remove('hidden');

      setMessage(`Giriş başarılı. Toplam ${data.users.length} kullanıcı bulundu.`, 'success');

      usersBody.innerHTML = '';
      data.users.forEach((u) => {
        const tr = document.createElement('tr');

        function td(v) {
          const cell = document.createElement('td');
          cell.textContent = v == null ? '' : String(v);
          return cell;
        }

        tr.appendChild(td(u.id));
        tr.appendChild(
          td(u.created_at ? new Date(u.created_at).toLocaleString('tr-TR') : '')
        );
        tr.appendChild(td(u.email || '—'));
        tr.appendChild(td(u.plan || 'free'));
        tr.appendChild(td(u.lang || 'tr'));
        tr.appendChild(td(u.credits ?? 0));
        tr.appendChild(td(u.ad_count ?? 0));
        tr.appendChild(td(u.last_ad_date || '—'));

        usersBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Admin panel isteği hatası:', err);
      setMessage('Bağlantı hatası. Biraz sonra tekrar dene.', 'error');
    } finally {
      loginBtn.disabled = false;
      if (pwInput) pwInput.value = '';
    }
  }

  // Sadece bu: Giriş butonuna tıklayınca loadUsers çağrılıyor.
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadUsers();
  });
});
