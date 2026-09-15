(() => {
  const BASE = '/Pump/assets/exercises/';
  const MEDIA_VERSION = '20260915h';

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

  function articleText(article) {
    const title = article.querySelector('div > b')?.textContent?.trim() || '';
    const body = article.textContent || '';
    return { title, body, text: `${title} ${body}` };
  }

  function resolveSlug(article) {
    const { title, body, text } = articleText(article);
    const has = (...parts) => parts.some(part => text.includes(part));

    // Core - exact movement first.
    if (has('דד־באג', 'דד באג', 'Dead Bug')) return 'dead-bug';
    if (has('פלאנק', 'Plank')) return 'plank';

    // Legs / glutes.
    if (has('לחיצת רגליים')) return 'leg-press';
    if (has('הרמת אגן', 'גשר ישבן', 'היפ תראסט', 'Glute Bridge')) return 'glute-bridge';
    if (has('סקוואט', 'ישיבה וקימה מכיסא', 'Squat')) return 'squat';
    if (has('הליכת צד עם גומייה')) return null;

    // Chest / push.
    if (has('לחיצת חזה במכונה', 'Chest Press Machine')) return 'chest-press-machine';
    if (has('לחיצת חזה עם משקולות', 'Dumbbell Floor Press')) return 'dumbbell-floor-press';
    if (has('שכיבות סמיכה בשיפוע', 'Incline Push-Up')) return 'incline-push-up';
    if (has('שכיבות סמיכה', 'Push-Up')) return 'push-up';
    if (has('מקבילים על ספסל', 'Bench Dips')) return 'bench-dips';
    if (has('לחיצה מול קיר', 'חזה · לחיצה עם גומייה')) return null;

    // Back / pull.
    if (has('פולי עליון', 'Lat Pulldown')) return 'lat-pulldown';
    if (has('חתירה ביד אחת', 'One-Arm Dumbbell Row')) return 'one-arm-dumbbell-row';
    if (has('חתירה עם גומייה', 'משיכת גומייה קלה לגוף', 'Resistance Band Row')) return 'resistance-band-row';
    if (has('חתירה בכבל', 'חתירה במכונה', 'Seated Cable Row')) return 'seated-cable-row';
    if (has('Y-T-W', 'כיווץ שכמות', 'קירוב שכמות')) return null;

    // Shoulders.
    if (has('הרחקות לצדדים', 'הרחקת כתפיים', 'Dumbbell Lateral Raise')) return 'dumbbell-lateral-raise';
    if (has('לחיצת כתפיים', 'Dumbbell Shoulder Press')) return 'dumbbell-shoulder-press';

    // Arms.
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

  function resolveExplanation(article) {
    const { title, body, text } = articleText(article);
    const has = (...parts) => parts.some(part => text.includes(part));

    if (has('דד־באג', 'דד באג', 'Dead Bug')) return 'שכבו על הגב עם ירכיים וברכיים ב־90°, הצמידו את הגב התחתון לרצפה והרחיקו לאט יד ורגל נגדיות. חזרו למרכז והחליפו צד.';
    if (has('פלאנק', 'Plank') || (title === 'בטן' && !body.includes('לכל צד'))) return 'הניחו אמות על הרצפה, ישרו את הגוף מהראש עד העקבים, כווצו בטן וישבן ושמרו שהאגן לא שוקע. נשמו רגיל לאורך ההחזקה.';

    if (has('היפ תראסט במכונה')) return 'מקמו את הגב העליון על המשענת ואת כפות הרגליים יציבות. דחפו את האגן למעלה דרך העקבים, כווצו ישבן בשיא התנועה והורידו בשליטה.';
    if (has('הרמת אגן', 'גשר ישבן', 'Glute Bridge')) return 'שכבו על הגב עם ברכיים כפופות וכפות רגליים ברוחב האגן. דחפו דרך העקבים, הרימו את האגן עד שהגוף בקו ישר וכווצו ישבן לפני ירידה איטית.';
    if (has('הליכת צד עם גומייה')) return 'מקמו גומייה מעל הברכיים או סביב הקרסוליים, כופפו מעט ברכיים והישארו נמוכים. בצעו צעדים קטנים לצד תוך שמירה על מתח בגומייה וברכיים בקו האצבעות.';
    if (has('לחיצת רגליים')) return 'מקמו את כפות הרגליים ברוחב כתפיים על הפלטה. הורידו את המשקל בטווח נוח ודחפו חזרה דרך כל כף הרגל בלי לנעול את הברכיים.';
    if (has('ישיבה וקימה מכיסא')) return 'שבו על קצה הכיסא עם כפות רגליים מתחת לברכיים. הטו מעט את הגוף קדימה, קומו דרך העקבים עד עמידה מלאה ושבו חזרה לאט ובשליטה.';
    if (has('סקוואט', 'Squat') || title === 'רגליים') return 'עמדו ברוחב כתפיים, שלחו את האגן לאחור ולמטה ושמרו חזה פתוח וברכיים בקו האצבעות. עלו חזרה דרך העקבים בלי לקרוס פנימה.';

    if (has('לחיצה מול קיר')) return 'עמדו מול קיר, הניחו ידיים מעט רחב מרוחב כתפיים ושמרו גוף ישר. כופפו מרפקים והקריבו את החזה לקיר, ואז דחפו חזרה בשליטה.';
    if (has('לחיצת חזה במכונה', 'Chest Press Machine')) return 'כוונו את המושב כך שהידיות יהיו בגובה אמצע החזה. הצמידו גב למשענת, דחפו קדימה כמעט עד יישור המרפקים והחזירו לאט.';
    if (has('לחיצת חזה עם משקולות', 'Dumbbell Floor Press')) return 'שכבו על הגב עם ברכיים כפופות והחזיקו משקולות לצד החזה. דחפו אותן מעל החזה עד כמעט יישור הידיים והורידו עד שהזרועות נוגעות בעדינות ברצפה.';
    if (has('חזה · לחיצה עם גומייה')) return 'עיגנו גומייה מאחור בגובה החזה, החזיקו קצוות ליד הצלעות ודחפו את הידיים קדימה. חזרו לאט בלי לתת לגומייה למשוך את הכתפיים לאחור.';
    if (has('שכיבות סמיכה בשיפוע', 'Incline Push-Up') || (title === 'חזה וידיים' && has('שולחן', 'ספה'))) return 'הניחו ידיים על שולחן או ספסל יציב ושמרו גוף בקו ישר. הורידו את החזה לכיוון המשטח עם מרפקים באלכסון לאחור ודחפו חזרה.';
    if (has('שכיבות סמיכה', 'Push-Up') || title === 'חזה וידיים') return 'מקמו ידיים מעט רחב מהכתפיים ושמרו גוף בקו ישר. הורידו את החזה לכיוון הרצפה עם מרפקים באלכסון לאחור ודחפו חזרה בלי לשקוע באגן.';
    if (has('מקבילים על ספסל', 'Bench Dips')) return 'שבו בקצה ספסל, הניחו ידיים ליד האגן והחליקו קדימה. כופפו מרפקים לאחור עד טווח נוח ודחפו דרך כפות הידיים חזרה למעלה.';

    if (has('פולי עליון', 'Lat Pulldown')) return 'שבו יציב, אחזו במוט מעט רחב מהכתפיים ומשכו אותו לכיוון החזה העליון תוך הורדת השכמות. החזירו את המוט למעלה לאט בלי להתנדנד.';
    if (has('חתירה ביד אחת', 'One-Arm Dumbbell Row')) return 'תמכו ביד אחת על ספסל ושמרו גב ניטרלי. משכו את המשקולת לכיוון הצלעות כשהמרפק נע לאחור, עצרו לרגע והורידו בשליטה.';
    if (has('חתירה עם גומייה', 'משיכת גומייה קלה לגוף', 'Resistance Band Row')) return 'עיגנו את הגומייה מולכם, שבו או עמדו זקוף ומשכו את הידיים לכיוון הצלעות. קרבו שכמות בלי להרים כתפיים והחזירו לאט.';
    if (has('חתירה בכבל', 'חתירה במכונה', 'Seated Cable Row')) return 'שבו זקוף עם חזה פתוח, משכו את הידית לכיוון הבטן תוך קירוב השכמות ושמרו מרפקים קרוב לגוף. החזירו קדימה בשליטה.';
    if (has('Y-T-W')) return 'שכבו על הבטן והרימו את הידיים מעט מהרצפה בשלוש צורות: Y, אחר כך T ואז W. בכל מצב משכו שכמות מעט לאחור ולמטה בלי לכווץ את הצוואר.';
    if (has('כיווץ שכמות', 'קירוב שכמות')) return 'שבו או עמדו זקוף, הורידו כתפיים מהאוזניים ומשכו את השכמות בעדינות לאחור ולמטה. החזיקו שנייה ושחררו בלי לקשת את הגב.';
    if (title === 'גב') return body.includes('מלמעלה') ? 'שבו זקוף, משכו את הידיים מלמעלה לכיוון החזה תוך הורדת השכמות והחזירו לאט.' : 'שמרו גב ניטרלי ומשכו את ההתנגדות לכיוון הגוף תוך קירוב השכמות. החזירו בשליטה בלי להתנדנד.';

    if (has('הרחקות לצדדים', 'הרחקת כתפיים', 'Dumbbell Lateral Raise')) return 'עמדו זקוף עם מרפקים מעט כפופים. הרימו את הידיים לצדדים עד בערך גובה הכתפיים והורידו לאט, בלי להרים כתפיים לכיוון האוזניים.';
    if (has('לחיצת כתפיים', 'Dumbbell Shoulder Press') || title === 'כתפיים') return 'החזיקו את המשקולות בגובה הכתפיים, כווצו בטן ודחפו מעל הראש בלי לקשת את הגב. הורידו חזרה עד גובה הכתפיים בשליטה.';

    if (has('כפיפת פטיש', 'Hammer Curl')) return 'החזיקו משקולות באחיזה ניטרלית כשהאגודלים פונים קדימה. שמרו מרפקים צמודים לגוף, כופפו עד הכתפיים והורידו לאט.';
    if (has('כפיפת מרפקים', 'Dumbbell Biceps Curl') || title === 'ידיים') return 'עמדו זקוף ושמרו מרפקים צמודים לצדי הגוף. כופפו את המרפקים בלי להזיז את הכתפיים, עצרו למעלה והורידו את ההתנגדות לאט.';
    if (has('פשיטת מרפקים מעל הראש', 'Overhead Triceps Extension')) return 'החזיקו משקולת מעל הראש בשתי ידיים, שמרו מרפקים פונים קדימה וכופפו אותם כדי להוריד את המשקולת מאחורי הראש. ישרו חזרה בלי לפתוח מרפקים לצדדים.';

    return 'בצעו את התנועה לאט ובשליטה, שמרו על יציבה יציבה ועצרו אם מופיע כאב חד או לא רגיל.';
  }

  function decorate() {
    document.querySelectorAll('.workout-card .exercise-list article').forEach(article => {
      const slug = resolveSlug(article);
      const explanation = resolveExplanation(article);
      const whyLine = article.querySelector('div > p');
      const alternativeLine = article.querySelector('div > em');

      if (whyLine) whyLine.dataset.pumpExplanation = explanation;

      if (alternativeLine) {
        const rawAlternative = alternativeLine.textContent?.trim() || '';
        const cleanAlternative = rawAlternative.replace(/^(?:חלופה:\s*)+/u, '').trim();
        alternativeLine.dataset.pumpAlternative = cleanAlternative;
      }

      // React can reuse an article between renders, so always clear stale media mappings first.
      if (!slug || !media[slug]) {
        delete article.dataset.exerciseDemo;
        article.style.removeProperty('--pump-exercise-image');
      } else {
        article.dataset.exerciseDemo = slug;
        article.style.setProperty('--pump-exercise-image', `url("${media[slug]}?v=${MEDIA_VERSION}")`);
      }
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

  window.PUMP_EXERCISE_MEDIA = {
    media,
    files,
    exactNameMap,
    refresh: decorate,
    resolveSlug,
    resolveExplanation
  };
})();
