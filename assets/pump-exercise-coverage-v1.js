(() => {
  const FEMALE_BASE = '/Pump/assets/exercises/';
  const VERSION = '20260918a';

  const missingMedia = [
    { match: ['הליכת צד עם גומייה'], slug: 'side-band-walk' },
    { match: ['לחיצה מול קיר'], slug: 'wall-push-up' },
    { match: ['חזה · לחיצה עם גומייה', 'לחיצה עם גומייה'], slug: 'band-chest-press' },
    { match: ['קירוב שכמות בישיבה'], slug: 'seated-scapular-retraction' },
    { match: ['Y-T-W בשכיבה', 'Y-T-W'], slug: 'prone-ytw' },
    { match: ['קירוב שכמות עדין'], slug: 'gentle-scapular-retraction' },
    { match: ['הרחקות ידיים ללא משקל'], slug: 'no-weight-lateral-raise' }
  ];

  const titleAliases = [
    {
      match: ['הרחקות לצדדים בכבל', 'הרחקות לצדדים עם גומייה', 'הרחקת כתפיים'],
      title: 'הרחקות לצדדים · כבל/משקולות/גומייה'
    },
    {
      match: ['כפיפת מרפקים בכבל', 'כפיפת מרפקים עם גומייה', 'כפיפת מרפקים עם בקבוקים'],
      title: 'כפיפת מרפקים · כבל/משקולות/גומייה/בקבוקים'
    },
    {
      match: ['היפ תראסט במכונה', 'הרמת אגן עם משקולת', 'הרמת אגן בשכיבה'],
      title: 'היפ תראסט / הרמת אגן · מכונה/משקולת/משקל גוף'
    },
    {
      match: ['ישיבה וקימה מכיסא'],
      title: 'סקוואט / ישיבה וקימה מכיסא'
    },
    {
      match: ['פולי עליון או חתירה במכונה'],
      title: 'פולי עליון / חתירה במכונה'
    }
  ];

  const checked = new Map();

  function imageExists(slug) {
    if (checked.has(slug)) return checked.get(slug);
    const promise = new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `${FEMALE_BASE}${slug}.webp?v=${VERSION}`;
    });
    checked.set(slug, promise);
    return promise;
  }

  function articleTitle(article) {
    return article.querySelector('div > b');
  }

  function normalizeTitles(article) {
    const titleNode = articleTitle(article);
    if (!titleNode) return;
    const text = article.textContent || '';
    for (const alias of titleAliases) {
      if (alias.match.some(part => text.includes(part))) {
        if (titleNode.textContent !== alias.title) titleNode.textContent = alias.title;
        return;
      }
    }
  }

  async function addMissingMedia(article) {
    if (article.dataset.exerciseDemo) return;
    const text = article.textContent || '';
    const rule = missingMedia.find(item => item.match.some(part => text.includes(part)));
    if (!rule) return;
    if (!(await imageExists(rule.slug))) return;

    article.dataset.exerciseDemo = rule.slug;
    article.classList.add('has-exercise-demo');
    window.PUMP_EXERCISE_GENDER?.refresh?.();
  }

  function apply() {
    document.querySelectorAll('.workout-card .exercise-list article').forEach(article => {
      normalizeTitles(article);
      addMissingMedia(article);
    });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('click', () => setTimeout(apply, 40), true);

  let retries = 0;
  const timer = setInterval(() => {
    apply();
    retries += 1;
    if (retries >= 24) clearInterval(timer);
  }, 250);
})();
