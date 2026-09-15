(() => {
  const BASE = '/Pump/assets/exercises/';
  const files = {
    squat: 'squat.webp',
    'leg-press': 'leg-press.webp',
    'glute-bridge': 'glute-bridge.webp',
    'push-up': 'push-up.webp',
    'incline-push-up': 'incline-push-up.webp',
    'dumbbell-floor-press': 'dumbbell-floor-press.webp',
    'chest-press-machine': 'chest-press-machine.webp',
    'bench-dips': 'bench-dips.webp',
    'one-arm-dumbbell-row': 'one-arm-dumbbell-row.webp',
    'resistance-band-row': 'resistance-band-row.webp',
    'seated-cable-row': 'seated-cable-row.webp',
    'lat-pulldown': 'lat-pulldown.webp',
    'dumbbell-shoulder-press': 'dumbbell-shoulder-press.webp',
    'dumbbell-lateral-raise': 'dumbbell-lateral-raise.webp',
    'dumbbell-biceps-curl': 'dumbbell-biceps-curl.webp',
    'hammer-curl': 'hammer-curl.webp',
    'overhead-triceps-extension': 'overhead-triceps-extension.webp',
    plank: 'plank.webp',
    'dead-bug': 'dead-bug.webp'
  };

  const media = Object.fromEntries(
    Object.entries(files).map(([slug, file]) => [slug, `${BASE}${file}`])
  );

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
      if (body.includes('גומייה')) return 'resistance-band-row';
      if (body.includes('ידיות') || body.includes('אל הגוף')) return 'seated-cable-row';
      return 'one-arm-dumbbell-row';
    }
    if (title === 'בטן') return body.includes('לכל צד') ? 'dead-bug' : 'plank';
    if (title === 'חזה וידיים') {
      if (body.includes('מכונה')) return 'chest-press-machine';
      if (body.includes('שולחן') || body.includes('ספה')) return 'incline-push-up';
      if (body.includes('משקולות יד')) return 'dumbbell-floor-press';
      return 'push-up';
    }
    if (title === 'רגליים') return body.includes('מכונה') ? 'leg-press' : 'squat';
    if (title === 'רגליים וישבן') return 'glute-bridge';
    if (title === 'כתפיים') return 'dumbbell-shoulder-press';
    return exactNameMap.get(title) || null;
  }

  function decorate() {
    document.querySelectorAll('.workout-card .exercise-list article').forEach(article => {
      const slug = resolveSlug(article);
      if (!slug || !media[slug]) return;

      // Do not inject extra DOM children into React-owned markup. React can remove them
      // on the next render. A data attribute + CSS pseudo-element is stable across renders.
      article.dataset.exerciseDemo = slug;
      article.style.setProperty('--pump-exercise-image', `url("${media[slug]}?v=20260915e")`);
    });
  }

  let scheduled = false;
  const scheduleDecorate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  };

  const observer = new MutationObserver(scheduleDecorate);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', decorate);
  document.addEventListener('click', () => setTimeout(decorate, 0), true);
  decorate();

  // A short startup retry window handles React/StrictMode timing without a permanent poll.
  let retries = 0;
  const retryTimer = window.setInterval(() => {
    decorate();
    retries += 1;
    if (retries >= 20) window.clearInterval(retryTimer);
  }, 250);

  window.PUMP_EXERCISE_MEDIA = { media, files, exactNameMap, refresh: decorate, resolveSlug };
})();
