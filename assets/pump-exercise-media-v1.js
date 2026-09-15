(() => {
  const BASE = '/Pump/assets/exercises/';
  const MEDIA_VERSION = '20260915g';

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
    ['Squat', 'squat'], ['סקוואט', 'squat'],
    ['Leg Press', 'leg-press'], ['לחיצת רגליים', 'leg-press'],
    ['Glute Bridge', 'glute-bridge'], ['גשר ישבן', 'glute-bridge'],
    ['Push-Up', 'push-up'], ['שכיבות סמיכה', 'push-up'],
    ['Incline Push-Up', 'incline-push-up'], ['שכיבות סמיכה בשיפוע', 'incline-push-up'],
    ['Dumbbell Floor Press', 'dumbbell-floor-press'], ['לחיצת חזה עם משקולות בשכיבה', 'dumbbell-floor-press'],
    ['Chest Press Machine', 'chest-press-machine'], ['לחיצת חזה במכונה', 'chest-press-machine'],
    ['Bench Dips', 'bench-dips'], ['מקבילים על ספסל', 'bench-dips'],
    ['One-Arm Dumbbell Row', 'one-arm-dumbbell-row'], ['חתירה ביד אחת', 'one-arm-dumbbell-row'],
    ['Resistance Band Row', 'resistance-band-row'], ['חתירה עם גומייה', 'resistance-band-row'],
    ['Seated Cable Row', 'seated-cable-row'], ['חתירה בכבל', 'seated-cable-row'],
    ['Lat Pulldown', 'lat-pulldown'], ['פולי עליון', 'lat-pulldown'],
    ['Dumbbell Shoulder Press', 'dumbbell-shoulder-press'], ['לחיצת כתפיים', 'dumbbell-shoulder-press'],
    ['Dumbbell Lateral Raise', 'dumbbell-lateral-raise'], ['הרחקת כתפיים', 'dumbbell-lateral-raise'],
    ['Dumbbell Biceps Curl', 'dumbbell-biceps-curl'], ['כפיפת מרפקים', 'dumbbell-biceps-curl'],
    ['Hammer Curl', 'hammer-curl'], ['כפיפת פטיש', 'hammer-curl'],
    ['Overhead Triceps Extension', 'overhead-triceps-extension'], ['פשיטת מרפקים מעל הראש', 'overhead-triceps-extension'],
    ['Plank', 'plank'], ['פלאנק', 'plank'],
    ['Dead Bug', 'dead-bug'], ['דד באג', 'dead-bug'], ['דד־באג', 'dead-bug']
  ]);

  function resolveSlug(article) {
    const title = article.querySelector('div > b')?.textContent?.trim() || '';
    const body = article.textContent || '';
    const text = `${title} ${body}`;
    const has = (...parts) => parts.some(part => text.includes(part));

    // Core - exact movement first.
    if (has('דד־באג', 'דד באג', 'Dead Bug')) return 'dead-bug';
    if (has('פלאנק', 'Plank')) return 'plank';

    // Legs / glutes.
    if (has('לחיצת רגליים')) return 'leg-press';
    if (has('הרמת אגן', 'גשר ישבן', 'היפ תראסט', 'Glute Bridge')) return 'glute-bridge';
    if (has('סקוואט', 'ישיבה וקימה מכיסא', 'Squat')) return 'squat';
    // Side-band walking has no matching demo in the current library, so do not fake one.
    if (has('הליכת צד עם גומייה')) return null;

    // Chest / push.
    if (has('לחיצת חזה במכונה', 'Chest Press Machine')) return 'chest-press-machine';
    if (has('לחיצת חזה עם משקולות', 'Dumbbell Floor Press')) return 'dumbbell-floor-press';
    if (has('שכיבות סמיכה בשיפוע', 'Incline Push-Up')) return 'incline-push-up';
    if (has('שכיבות סמיכה', 'Push-Up')) return 'push-up';
    if (has('מקבילים על ספסל', 'Bench Dips')) return 'bench-dips';
    // Wall/band chest presses do not yet have a truly matching demo.
    if (has('לחיצה מול קיר', 'חזה · לחיצה עם גומייה')) return null;

    // Back / pull. For the combined gym label, show the first exercise named: lat pulldown.
    if (has('פולי עליון', 'Lat Pulldown')) return 'lat-pulldown';
    if (has('חתירה ביד אחת', 'One-Arm Dumbbell Row')) return 'one-arm-dumbbell-row';
    if (has('חתירה עם גומייה', 'משיכת גומייה קלה לגוף', 'Resistance Band Row')) return 'resistance-band-row';
    if (has('חתירה בכבל', 'חתירה במכונה', 'Seated Cable Row')) return 'seated-cable-row';
    if (has('Y-T-W', 'כיווץ שכמות', 'קירוב שכמות')) return null;

    // Shoulders.
    if (has('הרחקות לצדדים', 'הרחקת כתפיים', 'Dumbbell Lateral Raise')) return 'dumbbell-lateral-raise';
    if (has('לחיצת כתפיים', 'Dumbbell Shoulder Press')) return 'dumbbell-shoulder-press';

    // Arms. These variants use the same elbow-flexion movement even if resistance changes.
    if (has('כפיפת פטיש', 'Hammer Curl')) return 'hammer-curl';
    if (has('כפיפת מרפקים', 'Dumbbell Biceps Curl')) return 'dumbbell-biceps-curl';
    if (has('פשיטת מרפקים מעל הראש', 'Overhead Triceps Extension')) return 'overhead-triceps-extension';

    // Older generic workout cards still supported.
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
      if (body.includes('משקולות')) return 'dumbbell-floor-press';
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

      // React can reuse an article between renders, so always clear stale mappings first.
      if (!slug || !media[slug]) {
        delete article.dataset.exerciseDemo;
        article.style.removeProperty('--pump-exercise-image');
        return;
      }

      article.dataset.exerciseDemo = slug;
      article.style.setProperty('--pump-exercise-image', `url("${media[slug]}?v=${MEDIA_VERSION}")`);
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

  // Short startup retries handle React/StrictMode timing without permanent polling.
  let retries = 0;
  const retryTimer = window.setInterval(() => {
    decorate();
    retries += 1;
    if (retries >= 20) window.clearInterval(retryTimer);
  }, 250);

  window.PUMP_EXERCISE_MEDIA = { media, files, exactNameMap, refresh: decorate, resolveSlug };
})();
