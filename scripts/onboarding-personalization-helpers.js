function pumpOnboardingPreferences(profile) {
  const preferences = pumpPersonalization(profile);
  const selectedEquipment = pumpPreferenceList(preferences.equipment);
  const defaultEquipment = profile?.trainingPlace === 'gym'
    ? ['gym']
    : profile?.trainingPlace === 'both'
      ? ['bodyweight', 'gym']
      : ['bodyweight'];

  return {
    foodStyle: preferences.foodStyle || 'regular',
    avoid: pumpPreferenceList(preferences.avoid),
    proteins: pumpPreferenceList(preferences.proteins),
    prep: preferences.prep || 'quick',
    budget: preferences.budget || 'regular',
    equipment: selectedEquipment.length ? selectedEquipment : defaultEquipment,
    trainingFocus: preferences.trainingFocus || 'balanced',
    limitation: preferences.limitation || 'none',
    sessionMinutes: preferences.sessionMinutes || '30',
  };
}

function pumpOnboardingUpdate(profile, setProfile, patch) {
  setProfile((current) => ({
    ...current,
    personalization: { ...pumpOnboardingPreferences(current), ...patch },
  }));
}

function pumpOnboardingToggle(profile, setProfile, field, value) {
  setProfile((currentProfile) => {
    const current = pumpPreferenceList(pumpOnboardingPreferences(currentProfile)[field]);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    return {
      ...currentProfile,
      personalization: { ...pumpOnboardingPreferences(currentProfile), [field]: next },
    };
  });
}

function pumpOnboardingSingle(profile, setProfile, field, options) {
  const preferences = pumpOnboardingPreferences(profile);
  return (0, V.jsx)('div', {
    className: 'select-grid',
    children: options.map(([value, title, detail]) => {
      const selected = preferences[field] === value;
      return (0, V.jsxs)('button', {
        type: 'button',
        className: selected ? 'select-card selected' : 'select-card',
        onClick: () => pumpOnboardingUpdate(profile, setProfile, { [field]: value }),
        children: [
          (0, V.jsx)('span', { children: selected ? '◉' : '○' }),
          (0, V.jsx)('b', { children: title }),
          (0, V.jsx)('small', { children: detail }),
        ],
      }, value);
    }),
  });
}

function pumpOnboardingMulti(profile, setProfile, field, options) {
  const selectedValues = pumpPreferenceList(pumpOnboardingPreferences(profile)[field]);
  return (0, V.jsx)('div', {
    className: 'select-grid',
    children: options.map(([value, title, detail]) => {
      const selected = selectedValues.includes(value);
      return (0, V.jsxs)('button', {
        type: 'button',
        className: selected ? 'select-card selected' : 'select-card',
        onClick: () => pumpOnboardingToggle(profile, setProfile, field, value),
        children: [
          (0, V.jsx)('span', { children: selected ? '✓' : '+' }),
          (0, V.jsx)('b', { children: title }),
          (0, V.jsx)('small', { children: detail }),
        ],
      }, value);
    }),
  });
}

function pumpOnboardingFoodStep(profile, setProfile) {
  return (0, V.jsxs)(V.Fragment, {
    children: [
      (0, V.jsx)('p', { className: 'kicker', children: 'בונים סביב מה שנוח לך' }),
      (0, V.jsxs)('h1', { children: ['איך נרכיב', (0, V.jsx)('br', {}), 'את התזונה שלך?'] }),
      (0, V.jsx)('p', {
        className: 'onboard-lead',
        children: 'זה משפיע על כל ההצעות בתפריט, כולל ארוחות הביניים.',
      }),
      (0, V.jsx)('p', { className: 'label-line', children: 'סגנון אכילה' }),
      pumpOnboardingSingle(profile, setProfile, 'foodStyle', [
        ['regular', 'הכול', 'אין סגנון קבוע'],
        ['vegetarian', 'צמחוני/ת', 'ללא בשר ודגים'],
        ['vegan', 'טבעוני/ת', 'ללא מוצרים מן החי'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'יש דברים שלא מתאימים לך?' }),
      (0, V.jsx)('p', { className: 'weekend-eating-note', children: 'אפשר לבחור כמה — או להשאיר ריק.' }),
      pumpOnboardingMulti(profile, setProfile, 'avoid', [
        ['dairy', 'חלב', 'מוצרי חלב'],
        ['eggs', 'ביצים', 'ללא ביצים'],
        ['fish', 'דגים וטונה', 'ללא דגים'],
        ['nuts', 'אגוזים ובוטנים', 'ללא אגוזים'],
        ['gluten', 'גלוטן', 'ללא גלוטן'],
        ['soy', 'סויה / טופו', 'ללא סויה'],
        ['meat', 'בשר ועוף', 'ללא בשר ועוף'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'איזה חלבונים אתה אוהב/ת?' }),
      pumpOnboardingMulti(profile, setProfile, 'proteins', [
        ['chicken', 'עוף', 'נוח ומהיר'],
        ['beef', 'בקר', 'לארוחה משביעה'],
        ['fish', 'דגים', 'דגים וטונה'],
        ['dairy', 'מוצרי חלב', 'סקיר, יוגורט וקוטג׳'],
        ['eggs', 'ביצים', 'פשוט לבית'],
        ['plant', 'חלבון צמחי', 'קטניות ואבקות צמחיות'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'כמה זמן יש להכנה בדרך כלל?' }),
      pumpOnboardingSingle(profile, setProfile, 'prep', [
        ['quick', 'עד 10 דקות', 'פתרונות קצרים ליום עמוס'],
        ['flexible', 'אפשר להשקיע', 'גם מתכונים שמכינים מראש'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'איך לשמור על התקציב?' }),
      pumpOnboardingSingle(profile, setProfile, 'budget', [
        ['budget', 'חסכוני', 'מעדיפים מרכיבים נגישים'],
        ['regular', 'גמיש', 'הגיוון חשוב יותר מהמחיר'],
      ]),
    ],
  });
}

function pumpOnboardingTrainingStep(profile, setProfile) {
  return (0, V.jsxs)(V.Fragment, {
    children: [
      (0, V.jsx)('p', { className: 'kicker', children: 'שומרים על אימון שאפשר לבצע' }),
      (0, V.jsxs)('h1', { children: ['איך נכון', (0, V.jsx)('br', {}), 'לך להתאמן?'] }),
      (0, V.jsx)('p', {
        className: 'onboard-lead',
        children: 'התרגילים, העומס והחלופות ייבחרו לפי מה שבאמת זמין לך.',
      }),
      (0, V.jsx)('p', { className: 'label-line', children: 'איזה ציוד יש לך?' }),
      (0, V.jsx)('p', { className: 'weekend-eating-note', children: 'אפשר לבחור יותר מאפשרות אחת.' }),
      pumpOnboardingMulti(profile, setProfile, 'equipment', [
        ['bodyweight', 'משקל גוף', 'ללא ציוד מיוחד'],
        ['dumbbells', 'משקולות יד', 'לתרגילי כוח בבית'],
        ['bands', 'גומיות', 'לעבודה קלה ומדויקת'],
        ['gym', 'חדר כושר', 'מכשירים ומשקולות'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'על מה לשים יותר דגש?' }),
      pumpOnboardingSingle(profile, setProfile, 'trainingFocus', [
        ['balanced', 'גוף מלא', 'איזון בין כל האזורים'],
        ['upper', 'פלג גוף עליון', 'חזה, גב וידיים'],
        ['lower', 'רגליים', 'רגליים וישבן'],
        ['glutes', 'ישבן', 'דגש על ישבן ורגליים'],
        ['core', 'ליבה', 'בטן ויציבה'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'יש אזור שצריך להתחשב בו?' }),
      pumpOnboardingSingle(profile, setProfile, 'limitation', [
        ['none', 'אין', 'אפשר לבנות מסלול מלא'],
        ['knee', 'ברך', 'נמנעים מעומס לא נוח'],
        ['back', 'גב', 'שומרים על תנועה מבוקרת'],
        ['shoulder', 'כתף', 'נמנעים מטווח כואב'],
      ]),
      (0, V.jsx)('p', { className: 'label-line spaced', children: 'כמה זמן באמת יש לאימון?' }),
      pumpOnboardingSingle(profile, setProfile, 'sessionMinutes', [
        ['20', '20 דקות', 'קצר וממוקד'],
        ['30', '30 דקות', 'מסלול מאוזן'],
        ['45', '45 דקות', 'יותר נפח והתקדמות'],
      ]),
      (0, V.jsx)('p', {
        className: 'weekend-eating-note',
        children: 'אם יש כאב חדש או חזק, לא מתאמנים דרכו ופונים לאיש מקצוע.',
      }),
    ],
  });
}
