(() => {
  function goHome() {
    const buttons = Array.from(document.querySelectorAll('button'));
    const home = buttons.find((button) => (button.textContent || '').trim() === 'היום')
      || buttons.find((button) => (button.textContent || '').includes('היום'));
    if (home) {
      home.click();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function decorateLogo() {
    document.querySelectorAll('.app-top .app-mark').forEach((logo) => {
      if (logo.dataset.pumpHomeReady === '1') return;
      logo.dataset.pumpHomeReady = '1';
      logo.setAttribute('role', 'button');
      logo.setAttribute('tabindex', '0');
      logo.setAttribute('aria-label', 'מעבר לדף היום');
      logo.addEventListener('click', goHome);
      logo.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goHome();
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
    const src = window.PUMP_EXERCISE_MEDIA?.media?.[slug];
    if (!src) return;
    ensureModal();
    modalImage.src = src + '?v=20260918a';
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

  const refresh = () => decorateLogo();
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
})();