(() => {
  const FEMALE_BASE = '/Pump/assets/exercises/';
  const MALE_BASE = '/Pump/assets/exercises-male/';
  const VERSION = '20260919a';

  const missingMedia = [
    { match: ['הליכת צד עם גומייה'], slug: 'lateral-band-walk' },
    { match: ['לחיצה מול קיר'], slug: 'wall-press' },
    { match: ['חזה · לחיצה עם גומייה', 'לחיצה עם גומייה'], slug: 'band-chest-press' },
    { match: ['קירוב שכמות בישיבה'], slug: 'seated-scapular-retraction' },
    { match: ['Y-T-W בשכיבה', 'Y-T-W'], slug: 'prone-ytw' },
    { match: ['קירוב שכמות עדין'], slug: 'gentle-scapular-retraction' },
    { match: ['הרחקות ידיים ללא משקל'], slug: 'bodyweight-lateral-raise' }
  ];

  const titleAliases = [
    {
      match: ['הרחקות לצדדים בכבל', 'הרחקות לצדדים עם גומייה', 'הרחקת כתפיים'],
      title: 'הרחקות לצדדים · כבל/משקולות'
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

  function currentSex() {
    return window.PUMP_EXERCISE_GENDER?.getSex?.() === 'male' ? 'male' : 'female';
  }

  function imageExists(slug, sex) {
    const key = `${sex}:${slug}`;
    if (checked.has(key)) return checked.get(key);
    const base = sex === 'male' ? MALE_BASE : FEMALE_BASE;
    const promise = new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `${base}${slug}.webp?v=${VERSION}`;
    });
    checked.set(key, promise);
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
    const text = article.textContent || '';
    const rule = missingMedia.find(item => item.match.some(part => text.includes(part)));
    if (!rule) return;

    const sex = currentSex();
    if (!(await imageExists(rule.slug, sex))) {
      if (article.dataset.exerciseDemo === rule.slug) {
        delete article.dataset.exerciseDemo;
        article.classList.remove('has-exercise-demo');
        article.style.removeProperty('--pump-exercise-image');
      }
      return;
    }

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
  window.addEventListener('pump:user-sex', () => {
    checked.clear();
    schedule();
  });

  let retries = 0;
  const timer = setInterval(() => {
    apply();
    retries += 1;
    if (retries >= 24) clearInterval(timer);
  }, 250);
})();
