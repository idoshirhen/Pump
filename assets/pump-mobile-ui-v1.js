(() => {
  function goHome(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const home = Array.from(document.querySelectorAll('.bottom-nav button'))
      .find((button) => (button.textContent || '').replace(/\s+/g, ' ').trim().endsWith('היום'));
    if (home) {
      home.click();
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
    }
  }

  function decorateLogo() {
    document.querySelectorAll('.app-top .app-mark').forEach((logo) => {
      if (logo.dataset.pumpHomeReady === '1') return;
      logo.dataset.pumpHomeReady = '1';
      logo.setAttribute('role', 'button');
      logo.setAttribute('tabindex', '0');
      logo.setAttribute('aria-label', 'מעבר לדף היום');
      logo.addEventListener('click', (event) => goHome(event));
      logo.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goHome(event);
        }
      });
    });
  }

  let modal;
  let modalImage;

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'pump-exercise-modal';
    modal.hidden = true;
    modal.innerHTML = '<div class="pump-exercise-modal__panel" role="dialog" aria-modal="true" aria-label="הדגמת תרגיל"><button type="button" class="pump-exercise-modal__close" aria-label="סגירה">×</button><img alt="הדגמת תרגיל מוגדלת"></div>';
    modalImage = modal.querySelector('img');
    modal.querySelector('.pump-exercise-modal__close').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    if (modalImage) modalImage.removeAttribute('src');
    document.body.style.removeProperty('overflow');
  }

  function openExercise(article) {
    const slug = article?.dataset?.exerciseDemo;
    const sex = article?.dataset?.exerciseGender || window.PUMP_EXERCISE_GENDER?.getSex?.() || 'female';
    const base = sex === 'male' ? '/Pump/assets/exercises-male/' : '/Pump/assets/exercises/';
    const src = base + slug + '.webp';
    ensureModal();
    modalImage.src = src + '?v=20260918b';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('click', (event) => {
    const article = event.target.closest?.('.workout-card .exercise-list article[data-exercise-demo]');
    if (!article) return;

    // The animation preview is the left-most column. Open only when that visual area is tapped.
    const rect = article.getBoundingClientRect();
    const previewWidth = window.matchMedia('(max-width: 510px)').matches ? 70 : 82;
    if (event.clientX <= rect.left + previewWidth) {
      event.preventDefault();
      openExercise(article);
    }
  }, true);


  const SUPABASE_URL = 'https://aebysqjymsjepvslidjl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';

  function getAccessToken() {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i) || '';
        if (!key.includes('aebysqjymsjepvslidjl') || !key.includes('auth-token')) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const token = parsed?.access_token || parsed?.currentSession?.access_token;
        if (token) return token;
      }
    } catch {}
    return '';
  }

  async function runAccountAction(action) {
    const token = getAccessToken();
    if (!token) {
      alert('לא מצאנו התחברות פעילה. נסה/י להתנתק ולהתחבר מחדש.');
      return false;
    }
    const response = await fetch(SUPABASE_URL + '/functions/v1/account-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ action })
    });
    if (!response.ok) {
      let message = 'הפעולה נכשלה. נסה/י שוב.';
      try {
        const data = await response.json();
        if (data?.error) message = data.error;
      } catch {}
      throw new Error(message);
    }
    return true;
  }

  async function resetAccountData(button) {
    if (!confirm('לאפס את כל נתוני המעקב שלך? שקילות, ארוחות, אימונים, העדפות והתקדמות יימחקו. החשבון עצמו יישאר ותעבור/י שוב על השאלון.')) return;
    button.disabled = true;
    const old = button.textContent;
    button.textContent = 'מאפסים…';
    try {
      if (await runAccountAction('reset')) {
        alert('הנתונים אופסו. האפליקציה תיטען מחדש לשאלון.');
        location.reload();
      }
    } catch (error) {
      alert(error.message || 'האיפוס נכשל.');
      button.disabled = false;
      button.textContent = old;
    }
  }

  async function deleteAccount(button) {
    if (!confirm('למחוק את החשבון לצמיתות? כל הנתונים והחשבון יימחקו ולא ניתן יהיה לשחזר אותם.')) return;
    if (!confirm('אישור אחרון: למחוק את המשתמש והנתונים לצמיתות?')) return;
    button.disabled = true;
    const old = button.textContent;
    button.textContent = 'מוחקים…';
    try {
      if (await runAccountAction('delete')) {
        try { localStorage.clear(); sessionStorage.clear(); } catch {}
        alert('החשבון נמחק.');
        location.reload();
      }
    } catch (error) {
      alert(error.message || 'מחיקת החשבון נכשלה.');
      button.disabled = false;
      button.textContent = old;
    }
  }

  function decorateAccountActions() {
    const settings = document.querySelector('.screen .settings');
    if (!settings || settings.dataset.pumpAccountActions === '1') return;
    settings.dataset.pumpAccountActions = '1';

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'pump-reset-account';
    reset.innerHTML = '↻ <span>איפוס נתוני משתמש</span><i>‹</i>';
    reset.addEventListener('click', () => resetAccountData(reset));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'pump-delete-account';
    remove.innerHTML = '× <span>מחיקת משתמש</span><i>‹</i>';
    remove.addEventListener('click', () => deleteAccount(remove));

    settings.appendChild(reset);
    settings.appendChild(remove);
  }

  const refresh = () => { decorateLogo(); decorateAccountActions(); };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
})();