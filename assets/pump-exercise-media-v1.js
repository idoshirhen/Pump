(() => {
  const media = window.PUMP_EXERCISE_DATA || {};

  const exactNameMap = new Map([
    ['Squat', 'squat'], ['סקוואט', 'squat'], ['רגליים', 'squat'],
    ['Leg Press', 'leg-press'], ['לחיצת רגליים', 'leg-press'],
    ['Glute Bridge', 'glute-bridge'], ['גשר ישבן', 'glute-bridge'], ['רגליים וישבן', 'glute-bridge'],
    ['Push-Up', 'push-up'], ['שכיבות סמיכה', 'push-up'], ['חזה וידיים', 'push-up'],
    ['Incline Push-Up', 'incline-push-up'], ['שכיבות סמיכה בשיפוע', 'incline-push-up'],
    ['Dumbbell Floor Press', 'dumbbell-floor-press'], ['לחיצת חזה עם משקולות בשכיבה', 'dumbbell-floor-press'],
    ['Chest Press Machine', 'chest-press-machine'], ['לחיצת חזה במכונה', 'chest-press-machine'],
    ['Bench Dips', 'bench-dips'], ['מקבילים על ספסל', 'bench-dips'],
    ['One-Arm Dumbbell Row', 'one-arm-dumbbell-row'], ['חתירה ביד אחת', 'one-arm-dumbbell-row'],
    ['Resistance Band Row', 'resistance-band-row'], ['חתירה עם גומייה', 'resistance-band-row'],
    ['Seated Cable Row', 'seated-cable-row'], ['חתירה בכבל', 'seated-cable-row'],
    ['Lat Pulldown', 'lat-pulldown'], ['פולי עליון', 'lat-pulldown'],
    ['Dumbbell Shoulder Press', 'dumbbell-shoulder-press'], ['לחיצת כתפיים', 'dumbbell-shoulder-press'], ['כתפיים', 'dumbbell-shoulder-press'],
    ['Dumbbell Lateral Raise', 'dumbbell-lateral-raise'], ['הרחקת כתפיים', 'dumbbell-lateral-raise'],
    ['Dumbbell Biceps Curl', 'dumbbell-biceps-curl'], ['כפיפת מרפקים', 'dumbbell-biceps-curl'],
    ['Hammer Curl', 'hammer-curl'], ['כפיפת פטיש', 'hammer-curl'],
    ['Overhead Triceps Extension', 'overhead-triceps-extension'], ['פשיטת מרפקים מעל הראש', 'overhead-triceps-extension'],
    ['Plank', 'plank'], ['פלאנק', 'plank'],
    ['Dead Bug', 'dead-bug'], ['דד באג', 'dead-bug']
  ]);

  function resolveSlug(article) {
    const title = article.querySelector('div > b')?.textContent?.trim() || '';
    const body = article.textContent || '';

    if (title === 'גב') {
      if (body.includes('מלמעלה') || body.includes('גב העליון')) return 'lat-pulldown';
      return 'one-arm-dumbbell-row';
    }
    if (title === 'בטן') return body.includes('לכל צד') ? 'dead-bug' : 'plank';
    if (title === 'חזה וידיים') {
      if (body.includes('מכונה')) return 'chest-press-machine';
      if (body.includes('שולחן') || body.includes('ספה')) return 'incline-push-up';
      return 'push-up';
    }
    if (title === 'רגליים') return body.includes('מכונה') ? 'leg-press' : 'squat';
    return exactNameMap.get(title) || null;
  }

  function decorate() {
    document.querySelectorAll('.workout-card .exercise-list article').forEach(article => {
      if (article.dataset.exerciseMediaReady === '1') return;
      const slug = resolveSlug(article);
      const src = media[slug];
      if (!slug || !src) return;

      const img = document.createElement('img');
      img.className = 'exercise-demo';
      img.alt = 'הדגמת תרגיל';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = src;
      img.dataset.exerciseSlug = slug;
      img.style.display = 'none';
      img.addEventListener('load', () => {
        img.style.display = 'block';
        article.classList.add('has-exercise-demo');
      }, { once: true });
      img.addEventListener('error', () => {
        article.dataset.exerciseMediaReady = '0';
        img.remove();
      }, { once: true });

      article.insertBefore(img, article.firstChild);
      article.dataset.exerciseMediaReady = '1';
    });
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', decorate);
  decorate();

  window.PUMP_EXERCISE_MEDIA = { media, exactNameMap, refresh: decorate, resolveSlug };
})();
