/* PUMP 3 core logic adapter for the frozen PUMP 2 UI.
   This file contains no DOM mutations and no visual code. */
(() => {
  'use strict';

  const activityMultiplier = Object.freeze({ low: 1.2, sedentary: 1.2, light: 1.375, medium: 1.55, high: 1.725 });
  const goalMultiplier = Object.freeze({ lose: 0.85, maintain: 1, gain: 1.10 });
  const proteinPerKg = Object.freeze({ lose: 1.8, maintain: 1.6, gain: 1.6 });

  const round10 = (value) => Math.round(value / 10) * 10;
  const round1 = (value) => Math.round(value * 10) / 10;
  const list = (value) => Array.isArray(value) ? value : [];

  function direction(profile) {
    if (profile.goal === 'gain') return 'gain';
    if (profile.goal === 'lose') return 'lose';
    if (profile.goal === 'event') {
      if (Number(profile.targetWeight) > Number(profile.startWeight)) return 'gain';
      if (Number(profile.targetWeight) < Number(profile.startWeight)) return 'lose';
    }
    return 'maintain';
  }

  function weeklyMeta(profile, goal) {
    if (goal === 'maintain') return { weeklyChange: 'שמירה על המשקל', eta: 'שמירה יציבה' };
    const steady = profile.pace === 'steady';
    const range = goal === 'gain'
      ? (steady ? [0.15, 0.3] : [0.25, 0.4])
      : (steady ? [0.25, 0.45] : [0.45, 0.65]);
    const label = goal === 'gain'
      ? (steady ? 'כ־0.2 ק״ג בשבוע' : 'כ־0.3 ק״ג בשבוע')
      : (steady ? 'כ־0.25 ק״ג בשבוע' : 'כ־0.5 ק״ג בשבוע');
    const delta = Math.abs(Number(profile.targetWeight) - Number(profile.startWeight));
    const minMonths = Math.max(1, Math.ceil(delta / range[1] / 4.345));
    const maxMonths = Math.max(minMonths, Math.ceil(delta / range[0] / 4.345));
    return { weeklyChange: label, eta: `כ־${minMonths}${minMonths === maxMonths ? '' : `–${maxMonths}`} ${maxMonths === 1 ? 'חודש' : 'חודשים'}` };
  }

  function targets(profile) {
    const goal = direction(profile);
    const sexOffset = profile.sex === 'male' ? 5 : -161;
    const bmr = Math.round(10 * Number(profile.startWeight) + 6.25 * Number(profile.height) - 5 * Number(profile.age) + sexOffset);
    const activity = activityMultiplier[profile.activity] ?? activityMultiplier.light;
    const maintenance = Math.round(bmr * activity);
    const calories = round10(maintenance * goalMultiplier[goal]);
    const protein = round1(Number(profile.startWeight) * proteinPerKg[goal]);
    const weekly = weeklyMeta(profile, goal);
    const goalLabel = profile.goal === 'event' ? 'הכנה לאירוע' : goal === 'gain' ? 'עלייה במשקל' : goal === 'lose' ? 'ירידה במשקל' : 'שמירה על המשקל';
    const days = Number(profile.trainingDays) || 0;
    const training = days === 0 ? 'מתחילים מתנועה יומיומית קלה' : `${days} אימונים בשבוע, ${profile.trainingPlace === 'gym' ? 'בחדר כושר' : profile.trainingPlace === 'home' ? 'בבית' : 'בבית ובחדר כושר'}`;
    return {
      bmr,
      maintenance,
      calories,
      protein,
      adjustment: 0,
      weeklyChange: weekly.weeklyChange,
      goalLabel,
      training,
      goalEta: weekly.eta,
      rules: { activity, goalMultiplier: goalMultiplier[goal], proteinPerKg: proteinPerKg[goal] },
    };
  }

  function level(profile) {
    return profile.trainingLevel === 'experienced' || profile.trainingLevel === 'advanced'
      ? 'advanced'
      : profile.trainingLevel === 'returning' || profile.trainingLevel === 'intermediate'
        ? 'intermediate'
        : 'beginner';
  }

  const prescriptionByLevel = Object.freeze({
    beginner: { sets: 2, reps: '8–12', rir: '3 חזרות ברזרבה' },
    intermediate: { sets: 3, reps: '8–15', rir: '2 חזרות ברזרבה' },
    advanced: { sets: 3, reps: '6–15', rir: '1–2 חזרות ברזרבה' },
  });

  function maxExercises(minutes) {
    const value = Number(minutes) || 30;
    if (value <= 20) return 4;
    if (value <= 30) return 5;
    if (value <= 45) return 6;
    return 7;
  }

  function equipment(profile, prefs) {
    const values = list(prefs.equipment);
    return {
      gym: values.includes('gym') || profile.trainingPlace === 'gym',
      dumbbells: values.includes('dumbbells'),
      bands: values.includes('bands'),
      bodyweight: values.includes('bodyweight') || !values.length,
    };
  }

  function detail(profile) {
    const rule = prescriptionByLevel[level(profile)];
    return `${rule.sets} סטים של ${rule.reps} · ${rule.rir} · מנוחה 60–90 שנ׳`;
  }

  function item(name, profile, why, alternative, detailOverride) {
    return { name, detail: detailOverride || detail(profile), why, alternative };
  }

  function exercise(profile, prefs, role) {
    const eq = equipment(profile, prefs);
    const limitation = prefs.limitation || 'none';
    const pain = limitation === 'none' ? '' : ' עובדים רק בטווח שלא מעורר כאב.';

    if (role === 'lower') {
      if (limitation === 'knee') return item(eq.gym ? 'ישבן · היפ תראסט במכונה' : eq.dumbbells ? 'ישבן · הרמת אגן עם משקולת' : 'ישבן · הרמת אגן בשכיבה', profile, `דגש על ישבן בלי כיפוף ברך עמוק.${pain}`, 'חלופה: הליכת צד עם גומייה או מנוחה אם יש כאב');
      if (limitation === 'back') return item(eq.gym ? 'רגליים · לחיצת רגליים בטווח נוח' : 'רגליים · ישיבה וקימה מכיסא', profile, `תנועה נשלטת עם גב ניטרלי.${pain}`, 'חלופה: הרמת אגן בשכיבה');
      return item(eq.gym ? 'רגליים · לחיצת רגליים במכונה' : eq.dumbbells ? 'רגליים · סקוואט גביע' : eq.bands ? 'רגליים · סקוואט עם גומייה' : 'רגליים · ישיבה וקימה מכיסא', profile, 'מחזק את הרגליים והישבן בתנועה יציבה.', 'חלופה: לאנג׳ לאחור בטווח נוח');
    }
    if (role === 'glutes') return item(eq.gym ? 'ישבן · היפ תראסט במכונה' : eq.dumbbells ? 'ישבן · הרמת אגן עם משקולת' : eq.bands ? 'ישבן · הליכת צד עם גומייה' : 'ישבן · הרמת אגן בשכיבה', profile, `מחזק את הישבן והחלק האחורי של הרגליים.${pain}`, 'חלופה: גשר ישבן עם עצירה למעלה');
    if (role === 'push') {
      if (limitation === 'shoulder') return item('חזה · לחיצה מול קיר בטווח נוח', profile, `עבודה עדינה ללא הרמה מעל הראש.${pain}`, 'חלופה: מנוחה אם התנועה מכאיבה');
      return item(eq.gym ? 'חזה · לחיצת חזה במכונה' : eq.dumbbells ? 'חזה · לחיצת חזה עם משקולות' : eq.bands ? 'חזה · לחיצה עם גומייה' : 'חזה · שכיבות סמיכה בשיפוע', profile, 'מחזק את החזה והיד האחורית.', 'חלופה: שכיבות סמיכה עם הידיים על שולחן');
    }
    if (role === 'pull') {
      if (limitation === 'shoulder') return item(eq.bands ? 'גב · משיכת גומייה קלה לגוף' : 'גב · כיווץ שכמות בישיבה', profile, `דגש על יציבה ושכמות בלי טווח כואב.${pain}`, 'חלופה: קירוב שכמות עדין');
      return item(eq.gym ? 'גב · פולי עליון או חתירה במכונה' : eq.dumbbells ? 'גב · חתירה ביד אחת עם משקולת' : eq.bands ? 'גב · חתירה עם גומייה' : 'גב · Y-T-W בשכיבה', profile, 'מחזק את הגב העליון ומשפר יציבה.', 'חלופה: משיכת גומייה בישיבה');
    }
    if (role === 'shoulder') {
      if (limitation === 'shoulder') return item('יציבה · קירוב שכמות עדין', profile, 'שומרים על כתף רגועה ולא מתאמנים דרך כאב.', 'חלופה: מנוחה', '2 סטים של 10–12 · מנוחה 60 שנ׳');
      return item(eq.gym ? 'כתפיים · הרחקות לצדדים בכבל' : eq.dumbbells ? 'כתפיים · הרחקות לצדדים עם משקולות' : eq.bands ? 'כתפיים · הרחקות לצדדים עם גומייה' : 'כתפיים · הרחקות ידיים ללא משקל', profile, 'מחזק את הכתפיים בשליטה.', 'חלופה: הרחקה בטווח קטן יותר');
    }
    if (role === 'arms') return item(eq.gym ? 'ידיים · כפיפת מרפקים בכבל' : eq.dumbbells ? 'ידיים · כפיפת מרפקים עם משקולות' : eq.bands ? 'ידיים · כפיפת מרפקים עם גומייה' : 'ידיים · כפיפת מרפקים עם בקבוקי מים', profile, 'עבודה ישירה לידיים.', 'חלופה: פשיטת מרפקים עם גומייה');
    if (role === 'calves') return item('רגליים · עליות עקב', profile, 'מחזק את השוקיים בעומס נמוך על הגב.', 'חלופה: עליות עקב בישיבה');
    return item('ליבה · דד־באג', profile, 'מחזק את הליבה בלי העמסה כבדה על עמוד השדרה.', 'חלופה: פלאנק על ברכיים', Number(prefs.sessionMinutes) <= 20 ? '2 סטים של 6–8 לכל צד' : '2–3 סטים של 8–10 לכל צד');
  }

  const focusRoles = Object.freeze({
    balanced: [
      ['lower', 'push', 'pull', 'core', 'glutes', 'shoulder', 'arms'],
      ['glutes', 'pull', 'push', 'core', 'lower', 'arms', 'calves'],
    ],
    upper: [
      ['push', 'pull', 'shoulder', 'core', 'arms', 'pull', 'lower'],
      ['pull', 'push', 'arms', 'core', 'shoulder', 'push', 'glutes'],
    ],
    lower: [
      ['lower', 'glutes', 'core', 'pull', 'calves', 'push', 'glutes'],
      ['glutes', 'lower', 'core', 'push', 'calves', 'pull', 'lower'],
    ],
    glutes: [
      ['glutes', 'lower', 'pull', 'core', 'glutes', 'push', 'calves'],
      ['glutes', 'lower', 'push', 'core', 'calves', 'pull', 'glutes'],
    ],
    core: [
      ['lower', 'push', 'core', 'pull', 'core', 'glutes', 'shoulder'],
      ['glutes', 'pull', 'core', 'push', 'core', 'lower', 'arms'],
    ],
  });

  function focusTitle(focus) {
    if (focus === 'upper') return 'פלג גוף עליון עם בסיס מאוזן';
    if (focus === 'lower') return 'רגליים וישבן עם בסיס עליון';
    if (focus === 'glutes') return 'ישבן ורגליים עם איזון מלא';
    if (focus === 'core') return 'ליבה חזקה עם אימון גוף מלא';
    return 'גוף מלא: רגליים, חזה וגב';
  }

  function weeklyPlan(profile) {
    const days = Number(profile.trainingDays) || 0;
    if (!days) return ['השבוע: 3 הליכות של 10–20 דקות', 'מטרת פתיחה: לבחור שעה קבועה אחת לתנועה', 'אין צורך להיכנס לאימון מלא עדיין'];
    return Array.from({ length: days }, (_, index) => `יום ${index + 1}: אימון ${index % 2 ? 'B' : 'A'}`);
  }

  function training(profile, prefs = {}) {
    const focus = prefs.trainingFocus || 'balanced';
    const roles = focusRoles[focus] || focusRoles.balanced;
    const count = maxExercises(prefs.sessionMinutes || 30);
    const title = focusTitle(focus);
    const limitationNote = prefs.limitation && prefs.limitation !== 'none' ? ' בהתאמה למגבלה שסימנת — לא ממשיכים דרך כאב.' : '';
    const goal = direction(profile);
    const description = goal === 'gain' ? 'מעלים משקל או חזרות רק כשהטכניקה נשארת נקייה.' : goal === 'lose' ? 'המטרה היא כוח ועקביות, לא אימוני ענישה.' : 'מתקדמים בהדרגה ובקצב שאפשר לשמור.';
    const makeSession = (sessionRoles, label, focusText) => ({
      label,
      title,
      focus: focusText,
      description: description + limitationNote,
      exercises: sessionRoles.slice(0, count).map((role) => exercise(profile, prefs, role)),
    });
    return {
      a: makeSession(roles[0], 'אימון A', 'אימון שנבנה לפי הדגש והציוד שלך'),
      b: makeSession(roles[1], 'אימון B', 'משלימים את קבוצות השריר החשובות'),
      location: equipment(profile, prefs).gym ? 'חדר כושר או ציוד ביתי שסימנת' : 'בית',
      weekly: weeklyPlan(profile),
      progression: goal === 'gain' ? 'מעלים עומס רק אחרי שהטכניקה נשארת יציבה.' : goal === 'lose' ? 'שומרים על כוח ועקביות לאורך השבוע.' : 'מתקדמים בהדרגה ובקצב שנוח לך.',
      audit: { level: level(profile), maxExercises: count, limitation: prefs.limitation || 'none' },
    };
  }

  window.PUMP3CoreLogic = Object.freeze({
    version: '1.0',
    targets,
    training,
    maxExercises,
  });
})();
