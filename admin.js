// admin.js — ŞİFRE KONTROLÜ YOK, sadece kullanıcı listesi çeker

document.addEventListener('DOMContentLoaded', () => {
  // Sayfadaki ilk form, ilk password input ve submit butonunu bul
  const form = document.querySelector('form');
  if (!form) return;

  const passwordInput = form.querySelector('input[type="password"]') || form.querySelector('input');
  const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');

  // Mesaj gösterecek alan
  let messageEl = document.getElementById('admin-message');
  if (!messageEl) {
    messageEl = document.createElement('p');
    messageEl.id = 'admin-message';
    messageEl.style.marginTop = '16px';
    messageEl.style.fontSize = '14px';
    form.parentNode.appendChild(messageEl);
  }

  // Opsiyonel: eğer tablolu liste varsa doldurmak için tbody
  const usersTbody = document.getElementById('admin-users-body');

  function setMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.style.color =
      type === 'error' ? '#e11d48' : type === 'success' ? '#16a34a' : '#111827';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    setMessage('Kullanıcı listesi yükleniyor...', 'info');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // ŞİFRE GÖNDERMİYORUZ, sadece liste istiyoruz
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ password: passwordInput?.value || '' }), // ARTIK YOK
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.error('JSON parse hatası', err);
      }

      if (!data || !Array.isArray(data.users)) {
        console.error('Beklenmeyen yanıt /api/admin-users:', res.status, data);
        setMessage('Sunucu hatası: kullanıcı listesi alınamadı.', 'error');
        return;
      }

      // Buraya geldiysek GİRİŞ BAŞARILI
      setMessage(`Giriş başarılı. Toplam ${data.users.length} kullanıcı var.`, 'success');

      // Eğer tabloda gövde alanı varsa doldur
      if (usersTbody) {
        usersTbody.innerHTML = '';

        data.users.forEach((u) => {
          const tr = document.createElement('tr');

          function td(text) {
            const cell = document.createElement('td');
            cell.textContent = text == null ? '' : String(text);
            cell.style.padding = '8px 12px';
            return cell;
          }

          tr.appendChild(td(u.id));
          tr.appendChild(td(u.created_at ? new Date(u.created_at).toLocaleString('tr-TR') : ''));
          tr.appendChild(td(u.email || '—'));
          tr.appendChild(td(u.plan || 'free'));
          tr.appendChild(td(u.lang || 'tr'));
          tr.appendChild(td(u.credits ?? 0));
          tr.appendChild(td(u.ad_count ?? 0));
          tr.appendChild(td(u.last_ad_date || '—'));

          usersTbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Admin panel isteği hatası:', err);
      setMessage('Bağlantı hatası. Biraz sonra tekrar dene.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (passwordInput) passwordInput.value = '';
    }
  });
});
