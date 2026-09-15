(() => {
  const SEX_KEY = 'pump-user-sex-v1';
  const FEMALE_BASE = '/Pump/assets/exercises/';
  const MALE_BASE = '/Pump/assets/exercises-male/';
  const MEDIA_VERSION = '20260915a';

  function normalizeSex(value) {
    const v = String(value || '').trim().toLowerCase();
    if (['male', 'man', 'm', 'גבר', 'זכר'].includes(v)) return 'male';
    if (['female', 'woman', 'f', 'אישה', 'נקבה'].includes(v)) return 'female';
    return '';
  }

  function saveSex(value) {
    const sex = normalizeSex(value);
    if (!sex) return;
    try {
      localStorage.setItem(SEX_KEY, sex);
    } catch {}
    window.dispatchEvent(new CustomEvent('pump:user-sex', { detail: { sex } }));
  }

  function currentSex() {
    try {
      return normalizeSex(localStorage.getItem(SEX_KEY));
    } catch {
      return '';
    }
  }

  // Capture the sex already stored in the user's Supabase profile without changing the React bundle.
  // This runs before the app module is loaded, so the normal profile request is observed once it happens.
  if (!window.__pumpGenderFetchWrapped && typeof window.fetch === 'function') {
    window.__pumpGenderFetchWrapped = true;
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await nativeFetch(...args);

      try {
        const request = args[0];
        const url = typeof request === 'string' ? request : request?.url || '';

        if (url.includes('/rest/v1/profiles')) {
          response.clone().json().then(data => {
            const row = Array.isArray(data) ? data[0] : data;
            if (row?.sex) saveSex(row.sex);
          }).catch(() => {});
        }
      } catch {}

      return response;
    };
  }

  function applyGender() {
    const sex = currentSex();
    const base = sex === 'male' ? MALE_BASE : FEMALE_BASE;

    document.querySelectorAll('.workout-card .exercise-list article[data-exercise-demo]').forEach(article => {
      const slug = article.dataset.exerciseDemo;
      if (!slug) return;

      article.dataset.exerciseGender = sex || 'female';
      article.style.setProperty(
        '--pump-exercise-image',
        `url("${base}${slug}.webp?v=${MEDIA_VERSION}")`
      );
    });
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyGender();
    });
  }

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-exercise-demo']
  });

  window.addEventListener('pump:user-sex', scheduleApply);
  window.addEventListener('storage', event => {
    if (event.key === SEX_KEY) scheduleApply();
  });
  document.addEventListener('DOMContentLoaded', scheduleApply);
  document.addEventListener('click', () => setTimeout(applyGender, 30), true);

  // React/StrictMode and the exercise decorator can render a moment after page load.
  let retries = 0;
  const retryTimer = window.setInterval(() => {
    applyGender();
    retries += 1;
    if (retries >= 24) window.clearInterval(retryTimer);
  }, 250);

  window.PUMP_EXERCISE_GENDER = {
    refresh: applyGender,
    getSex: currentSex,
    setSex: saveSex
  };
})();
