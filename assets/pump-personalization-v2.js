/* PUMP v2 personalization: a small, isolated preference flow that persists
   per user and asks the native application to re-fetch its plan on save. */
(() => {
  const apiUrl = 'https://aebysqjymsjepvslidjl.supabase.co/rest/v1';
  const publishableKey = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';
  const state = { userId: null, preferences: null, profile: null, loading: null };

  const defaults = {
    version: 2,
    foodStyle: 'regular',
    avoid: [],
    proteins: [],
    prep: 'quick',
    budget: 'regular',
    equipment: ['bodyweight'],
    trainingFocus: 'balanced',
    limitation: 'none',
    sessionMinutes: '30'
  };

  const labels = {
    foodStyle: { regular: 'הכול מתאים לי', vegetarian: 'צמחוני/ת', vegan: 'טבעוני/ת' },
    avoid: { dairy: 'מוצרי חלב', eggs: 'ביצים', fish: 'דגים / טונה', nuts: 'אגוזים / בוטנים', gluten: 'גלוטן', soy: 'סויה / טופו', meat: 'עוף ובשר' },
    proteins: { chicken: 'עוף', beef: 'בקר', fish: 'דגים / טונה', dairy: 'מוצרי חלב', eggs: 'ביצים', plant: 'חלבון צמחי' },
    prep: { quick: 'עד 10 דקות', flexible: 'אפשר גם לבשל' },
    budget: { budget: 'חסכוני', regular: 'רגיל / גמיש' },
    equipment: { bodyweight: 'משקל גוף', dumbbells: 'משקולות יד', bands: 'גומיות', gym: 'חדר כושר' },
    trainingFocus: { balanced: 'גוף מלא מאוזן', upper: 'פלג גוף עליון', lower: 'רגליים', glutes: 'ישבן', core: 'בטן וליבה' },
    limitation: { none: 'אין', knee: 'ברך', back: 'גב', shoulder: 'כתף' },
    sessionMinutes: { '20': '20 דקות', '30': '30 דקות', '45': '45 דקות' }
  };

  function readSession() {
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !key.includes('auth-token')) continue;
        const raw = JSON.parse(localStorage.getItem(key) || '{}');
        const session = raw.currentSession || raw.session || raw;
        if (session?.access_token && session?.user?.id) return session;
      }
    } catch (_) { /* The host app still works if browser storage is unavailable. */ }
    return null;
  }

  async function api(session, path, options = {}) {
    const response = await fetch(`${apiUrl}/${path}`, {
      ...options,
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!response.ok) throw new Error('לא הצלחנו לשמור את ההתאמה האישית. נסו שוב.');
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function normalise(profile, preferences) {
    const saved = preferences && typeof preferences === 'object' ? preferences : {};
    const diet = String(profile?.diet || '');
    const inferredStyle = /טבעונ/i.test(diet) ? 'vegan' : /צמחונ/i.test(diet) ? 'vegetarian' : defaults.foodStyle;
    const inferredEquipment = profile?.training_place === 'gym'
      ? ['gym']
      : profile?.training_place === 'both'
        ? ['bodyweight', 'gym']
        : defaults.equipment;
    return {
      ...defaults,
      foodStyle: inferredStyle,
      equipment: inferredEquipment,
      ...saved,
      avoid: Array.isArray(saved.avoid) ? saved.avoid : [],
      proteins: Array.isArray(saved.proteins) ? saved.proteins : [],
      equipment: Array.isArray(saved.equipment) && saved.equipment.length ? saved.equipment : inferredEquipment
    };
  }

  async function loadPreferences(force = false) {
    const session = readSession();
    if (!session) return null;
    if (!force && state.userId === session.user.id && state.preferences) return { session, profile: state.profile, preferences: state.preferences };
    if (!force && state.loading) return state.loading;
    state.loading = Promise.all([
      api(session, `user_personalization?select=preferences&user_id=eq.${encodeURIComponent(session.user.id)}`),
      api(session, `profiles?select=diet,training_place&id=eq.${encodeURIComponent(session.user.id)}`)
    ]).then(([preferenceRows, profileRows]) => {
      const profile = Array.isArray(profileRows) ? profileRows[0] : null;
      const saved = Array.isArray(preferenceRows) ? preferenceRows[0]?.preferences : null;
      const preferences = normalise(profile, saved);
      state.userId = session.user.id;
      state.profile = profile;
      state.preferences = preferences;
      return { session, profile, preferences };
    }).finally(() => { state.loading = null; });
    return state.loading;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function cardCopy(preferences) {
    if (!preferences) return 'כמה שאלות קצרות, והתפריט והאימונים ייבנו סביב השגרה והציוד שלך.';
    const items = [labels.foodStyle[preferences.foodStyle], labels.prep[preferences.prep], labels.trainingFocus[preferences.trainingFocus]].filter(Boolean);
    return `פעיל: ${items.join(' · ')}. אפשר לערוך בכל רגע.`;
  }

  function mountCard() {
    const root = window.document;
    if (!root?.documentElement) return;
    const daily = root.querySelector('.daily-card');
    const screen = daily?.closest('.screen');
    if (!daily || !screen || screen.querySelector('.pump-personalization-card')) return;
    const card = element('section', 'pump-personalization-card');
    const kicker = element('small', '', 'התאמה אישית');
    const title = element('b', '', 'המסלול שלך יכול להיות מדויק יותר');
    const copy = element('p', '', cardCopy(state.preferences));
    const button = element('button', 'pump-personalization-open', state.preferences ? 'עריכת ההתאמה' : 'בניית התאמה אישית');
    button.type = 'button';
    button.addEventListener('click', () => openModal());
    card.append(kicker, title, copy, button);
    daily.after(card);
  }

  function optionGroup({ key, title, helper, multiple = false, values, preferences }) {
    const section = element('section', 'pump-personalization-question');
    const heading = element('b', '', title);
    section.append(heading);
    if (helper) section.append(element('small', '', helper));
    const choices = element('div', 'pump-personalization-choices');
    Object.entries(values).forEach(([value, text]) => {
      const button = element('button', '', text);
      button.type = 'button';
      button.dataset.value = value;
      const selected = multiple ? preferences[key].includes(value) : preferences[key] === value;
      button.classList.toggle('active', selected);
      button.addEventListener('click', () => {
        if (multiple) {
          preferences[key] = preferences[key].includes(value)
            ? preferences[key].filter((item) => item !== value)
            : [...preferences[key], value];
        } else {
          preferences[key] = value;
        }
        [...choices.children].forEach((choice) => {
          const active = multiple ? preferences[key].includes(choice.dataset.value) : preferences[key] === choice.dataset.value;
          choice.classList.toggle('active', active);
        });
      });
      choices.append(button);
    });
    section.append(choices);
    return section;
  }

  function closeModal() {
    document.querySelector('.pump-personalization-backdrop')?.remove();
  }

  async function openModal() {
    let loaded;
    try {
      loaded = await loadPreferences();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'לא הצלחנו לפתוח את ההתאמה האישית.');
      return;
    }
    if (!loaded) return;
    closeModal();
    const preferences = typeof structuredClone === 'function'
      ? structuredClone(loaded.preferences)
      : JSON.parse(JSON.stringify(loaded.preferences));
    const backdrop = element('div', 'pump-personalization-backdrop');
    const form = element('form', 'pump-personalization-modal');
    const close = element('button', 'pump-personalization-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'סגירת ההתאמה האישית');
    close.addEventListener('click', closeModal);
    const kicker = element('p', 'kicker', 'ההתאמה האישית שלך');
    const title = element('h2', '', 'נבנה סביב החיים שלך.');
    const intro = element('p', 'pump-personalization-intro', 'הבחירות האלו משנות את סוגי הארוחות, החלופות והתרגילים — לא רק את הטקסט שמסביב.');
    form.append(close, kicker, title, intro);

    form.append(
      optionGroup({ key: 'foodStyle', title: 'איך את/ה אוכל/ת בדרך כלל?', values: labels.foodStyle, preferences }),
      optionGroup({ key: 'avoid', title: 'יש מרכיבים שלא מתאימים לך?', helper: 'האפשרויות האלה יוסרו מההצעות. ברגישות או אלרגיה תמיד בודקים רכיבים בפועל.', values: labels.avoid, multiple: true, preferences }),
      optionGroup({ key: 'proteins', title: 'על אילו מקורות חלבון נעדיף לשים דגש?', helper: 'אפשר לסמן כמה או להשאיר פתוח לגיוון.', values: labels.proteins, multiple: true, preferences }),
      optionGroup({ key: 'prep', title: 'כמה זמן ריאלי יש להכין אוכל?', values: labels.prep, preferences }),
      optionGroup({ key: 'budget', title: 'מה מתאים מבחינת תקציב?', values: labels.budget, preferences }),
      optionGroup({ key: 'equipment', title: 'איזה ציוד באמת זמין לך?', values: labels.equipment, multiple: true, preferences }),
      optionGroup({ key: 'trainingFocus', title: 'על מה תרצה/י לשים דגש באימונים?', values: labels.trainingFocus, preferences }),
      optionGroup({ key: 'limitation', title: 'יש אזור שדורש התאמה?', helper: 'לא בונים אימון דרך כאב. במקרה של כאב חד, מתמשך או מגבלה רפואית — עוצרים ופונים לאיש/אשת מקצוע.', values: labels.limitation, preferences }),
      optionGroup({ key: 'sessionMinutes', title: 'כמה זמן אימון באמת מתאים ליום שלך?', values: labels.sessionMinutes, preferences })
    );

    const status = element('p', 'pump-personalization-status');
    const save = element('button', 'pump-personalization-save', 'שמירת התאמה ועדכון התוכנית');
    save.type = 'submit';
    form.append(status, save);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!preferences.equipment.length) preferences.equipment = ['bodyweight'];
      save.disabled = true;
      save.textContent = 'מעדכנים את התוכנית…';
      status.textContent = '';
      try {
        await api(loaded.session, 'user_personalization?on_conflict=user_id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify({ user_id: loaded.session.user.id, preferences: { ...preferences, version: 2 } })
        });
        state.preferences = { ...preferences, version: 2 };
        state.userId = loaded.session.user.id;
        window.dispatchEvent(new CustomEvent('pump-personalization:updated'));
        status.textContent = 'התוכנית מתעדכנת עכשיו — בלי טעינה מחדש.';
        save.textContent = 'נשמר ✓';
        window.setTimeout(() => {
          closeModal();
          document.querySelector('.pump-personalization-card')?.remove();
          mountCard();
        }, 450);
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : 'לא הצלחנו לשמור. נסו שוב.';
        save.disabled = false;
        save.textContent = 'שמירת התאמה ועדכון התוכנית';
      }
    });
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(); });
    backdrop.append(form);
    document.body.append(backdrop);
  }

  const style = document.createElement('style');
  style.textContent = `
    .pump-personalization-card{display:grid;gap:8px;margin:16px 0;padding:17px;border:1px solid #ff6b0088;border-radius:18px;background:linear-gradient(135deg,#21160e,#14110e)}
    .pump-personalization-card small{color:#ffad75;font-size:12px;font-weight:800}.pump-personalization-card b{font-size:17px}.pump-personalization-card p{margin:0;color:#c7b8ae;font-size:13px;line-height:1.45}.pump-personalization-open,.pump-personalization-save{border:0;border-radius:12px;background:#ff6b00;color:#111;padding:12px 14px;font:inherit;font-weight:900;cursor:pointer}.pump-personalization-open{justify-self:start;margin-top:2px}.pump-personalization-backdrop{position:fixed;z-index:80;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:18px;background:#000b;backdrop-filter:blur(4px)}
    .pump-personalization-modal{position:relative;box-sizing:border-box;width:min(100%,620px);max-height:calc(100dvh - 36px);overflow:auto;padding:22px;border:1px solid #3c3c3c;border-radius:24px;background:#171717;color:#f7f7f7;box-shadow:0 20px 60px #0008}.pump-personalization-modal h2{margin:2px 0 6px;font-size:25px}.pump-personalization-intro{margin:0 0 18px;color:#bdbdbd;font-size:13px;line-height:1.5}.pump-personalization-close{position:absolute;top:12px;left:12px;width:32px;height:32px;border:1px solid #555;border-radius:50%;background:#242424;color:#fff;font-size:22px;line-height:1;cursor:pointer}
    .pump-personalization-question{display:grid;gap:7px;padding:13px 0;border-top:1px solid #303030}.pump-personalization-question b{font-size:14px}.pump-personalization-question small{color:#aaa;font-size:12px;line-height:1.4}.pump-personalization-choices{display:flex;flex-wrap:wrap;gap:7px}.pump-personalization-choices button{border:1px solid #444;border-radius:999px;background:#202020;color:#eee;padding:8px 11px;font:inherit;font-size:12px;cursor:pointer}.pump-personalization-choices button.active{border-color:#ff6b00;background:#ff6b0024;color:#ffab74}.pump-personalization-status{min-height:18px;margin:13px 0 8px;color:#ffbb8a;font-size:12px}.pump-personalization-save{width:100%}.pump-personalization-save:disabled{opacity:.7;cursor:wait}
  `;
  document.head.append(style);

  const refresh = () => mountCard();
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  refresh();
})();
