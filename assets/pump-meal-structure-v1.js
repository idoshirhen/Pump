/* PUMP meal-structure assistant: keeps the existing onboarding data model,
   while deriving the meal structure from a person's actual routine. */
(() => {
  const storageKey = 'pump-meal-structure-v1';
  const options = {
    breakfast: [['always', 'כן, כמעט תמיד'], ['sometimes', 'לפעמים'], ['no', 'בדרך כלל לא']],
    toughTime: [['morning', 'בבוקר'], ['afternoon', 'בין צהריים לערב'], ['evening', 'בערב'], ['varies', 'אין שעה קבועה']],
    longGap: [['yes', 'כן'], ['no', 'לא']],
    trainingTime: [['morning', 'בוקר'], ['noon', 'צהריים'], ['evening', 'אחר הצהריים / ערב'], ['varies', 'אין זמן קבוע']],
    hungerResponse: [['wait', 'אני מסתדר/ת עד הארוחה הבאה'], ['snack', 'אני מנשנש/ת דברים לא מתוכננים'], ['ravenous', 'אני מגיע/ה מורעב/ת לארוחה הבאה']]
  };

  const read = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  };
  const write = (value) => localStorage.setItem(storageKey, JSON.stringify(value));

  const recommend = (answers) => {
    const goal = read().goal;
    const needsMoreStructure = answers.longGap === 'yes' || answers.trainingTime === 'evening' || answers.hungerResponse === 'snack' || answers.hungerResponse === 'ravenous' || answers.toughTime === 'evening';
    if (goal === 'gain') {
      return { pattern: 'flexible', meals: '3 ארוחות עיקריות ו־2 ארוחות ביניים', reason: 'כדי להקל על הגעה לכמות האנרגיה היומית בלי להעמיס בארוחה אחת.', snacks: 2 };
    }
    if (answers.breakfast === 'no') {
      return { pattern: 'two', meals: '2 ארוחות עיקריות ו־2 ארוחות ביניים', reason: 'כי הבוקר לא חלק קבוע מהיום שלך, נשמור על פתיחה גמישה ונמנע מפערים ארוכים בלי אוכל.', snacks: 2 };
    }
    if (needsMoreStructure) {
      return { pattern: 'flexible', meals: '3 ארוחות עיקריות ו־2 ארוחות ביניים', reason: 'כדי שלא תגיע/י רעב/ה מדי לערב או לארוחה הבאה.', snacks: 2 };
    }
    return { pattern: 'three', meals: '3 ארוחות עיקריות וארוחת ביניים אחת', reason: 'זו מסגרת מאוזנת שמתאימה לשגרה שתיארת.', snacks: 1 };
  };

  const buttonGroup = (key, label, answers, onChange) => {
    const wrap = document.createElement('div');
    wrap.className = 'pump-meal-question';
    const title = document.createElement('p');
    title.textContent = label;
    wrap.append(title);
    const choices = document.createElement('div');
    choices.className = 'pump-meal-choices';
    options[key].forEach(([value, text]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.dataset.value = value;
      button.classList.toggle('active', answers[key] === value);
      button.addEventListener('click', () => onChange(key, value));
      choices.append(button);
    });
    wrap.append(choices);
    return wrap;
  };

  const sourceOptionFor = (list, pattern) => [...list.querySelectorAll('button')].find((button) => {
    const text = (button.textContent || '').trim();
    return pattern === 'two' ? text.includes('2 ארוחות') : pattern === 'three' ? text.startsWith('3 ארוחות') : text.includes('גמיש');
  });

  const mountOnboarding = () => {
    const body = document.querySelector('.onboarding-body');
    if (!body || !body.textContent.includes('כמה ארוחות נוחות לך ביום?')) return;
    const sourceLabel = [...body.querySelectorAll('.label-line')].find((node) => node.textContent.includes('כמה ארוחות נוחות'));
    if (!sourceLabel || body.querySelector('.pump-meal-structure')) return;
    const sourceList = sourceLabel.nextElementSibling;
    if (!sourceList || !sourceList.classList.contains('activity-list')) return;

    /* React can redraw this step after our script has mounted. Mark both original
       controls permanently instead of relying only on the one-time hidden flag. */
    sourceLabel.hidden = true;
    sourceList.hidden = true;
    sourceLabel.classList.add('pump-meal-source-hidden');
    sourceList.classList.add('pump-meal-source-hidden');
    const saved = read();
    const answers = saved.answers || {};
    const panel = document.createElement('section');
    panel.className = 'pump-meal-structure';
    panel.innerHTML = '<p class="kicker">מבנה הארוחות שלך</p><h2>נבנה את היום שלך<br>לפי השגרה האמיתית.</h2><p class="pump-meal-intro">לא בוחרים מספר ארוחות. כמה שאלות קצרות, ו־PUMP מרכיב עבורך את המסגרת.</p>';

    const apply = () => {
      const plan = recommend(answers);
      write({ ...read(), answers, plan });
      const sourceOption = sourceOptionFor(sourceList, plan.pattern);
      if (sourceOption && !sourceOption.classList.contains('active')) sourceOption.click();
      panel.querySelector('.pump-meal-result')?.remove();
      if (Object.keys(answers).length !== Object.keys(options).length) return;
      const result = document.createElement('div');
      result.className = 'pump-meal-result';
      result.innerHTML = `<small>המסלול שנבחר עבורך</small><b>${plan.meals}</b><span>${plan.reason}</span>`;
      panel.append(result);
    };
    const change = (key, value) => {
      answers[key] = value;
      [...panel.querySelectorAll(`button[data-question="${key}"]`)].forEach((button) => button.classList.toggle('active', button.dataset.value === value));
      apply();
    };
    Object.entries({
      breakfast: 'האם את/ה אוכל/ת בדרך כלל ארוחת בוקר?',
      toughTime: 'באיזה חלק של היום הכי קשה לשמור על התפריט?',
      longGap: 'יש בדרך כלל יותר מ־4 שעות בלי אפשרות לאכול?',
      trainingTime: 'מתי את/ה מתאמן/ת בדרך כלל?',
      hungerResponse: 'מה קורה כשעולה רעב בין ארוחות?'
    }).forEach(([key, label]) => {
      const question = buttonGroup(key, label, answers, change);
      question.querySelectorAll('button').forEach((button) => button.dataset.question = key);
      panel.append(question);
    });
    sourceLabel.before(panel);
    apply();
  };

  const inferPlan = () => {
    const saved = read().plan;
    if (saved) return saved;
    const title = document.querySelector('.menu-title b')?.textContent || '';
    return title.includes('2')
      ? { meals: '2 ארוחות עיקריות ו־2 ארוחות ביניים', snacks: 2 }
      : { meals: '3 ארוחות עיקריות וארוחת ביניים אחת', snacks: 1 };
  };

  const improveSummary = () => {
    const plan = read().plan;
    const list = document.querySelector('.personal-plan ul');
    if (!plan || !list || list.querySelector('.pump-meal-summary')) return;
    const item = document.createElement('li');
    item.className = 'pump-meal-summary';
    item.textContent = `מבנה האכילה שלך: ${plan.meals}.`;
    list.append(item);
  };

  const improveNutrition = () => {
    const plan = inferPlan();
    const mainMeals = plan.pattern === 'two' ? 2 : 3;
    const count = document.querySelector('.menu-title b');
    if (count) count.textContent = plan.meals;
    const titleCount = document.querySelector('.menu-title small');
    if (titleCount) titleCount.textContent = `${mainMeals} ארוחות עיקריות + ${plan.snacks} ארוחות ביניים`;
  };

  /* Kept outside the compiled bundle: a broken enhancement must never break the route. */
  const SB = 'https://aebysqjymsjepvslidjl.supabase.co';
  const SB_KEY = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';
  const snacks = [
    { title: 'פרי וסקיר / יוגורט PRO', detail: 'פרי אחד עם סקיר או יוגורט חלבון. אפשר להחליף במעדן חלבון.', calories: 170, protein: 18 },
    { title: 'כריך קטן עם חלבון', detail: '2 פרוסות לחם מלא עם קוטג׳, טונה או ביצה. אפשר להחליף בשייק חלבון ובננה.', calories: 250, protein: 20 },
    { title: 'אגוזים ופרי', detail: 'חופן קטן של אגוזים עם פרי. אפשר להחליף ביוגורט חלבון.', calories: 180, protein: 8 }
  ];
  const number = (value) => Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;
  const date = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const getSession = () => {
    try { for (let i = 0; i < localStorage.length; i += 1) { const k = localStorage.key(i); if (!k?.includes('auth-token')) continue; const v = JSON.parse(localStorage.getItem(k) || '{}'); const s = v.currentSession || v.session || v; if (s?.access_token && s?.user?.id) return s; } } catch (_) {}
    return null;
  };
  const api = async (path, token, init = {}) => {
    const response = await fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
    if (!response.ok) throw new Error('לא הצלחנו לשמור. נסו שוב.');
    return response.status === 204 ? null : response.json();
  };
  const coreCards = () => [...document.querySelectorAll('.menu-list > article:not(.pump-snack-meal)')];
  const distribute = (plan) => {
    const cards = coreCards(), snackTotal = snacks.slice(0, plan.snacks || 0).reduce((s, x) => s + x.calories, 0);
    const total = cards.reduce((s, c) => s + number(c.dataset.pumpBaseCalories || c.querySelector('small')?.textContent), 0);
    if (!total || snackTotal >= total) return;
    let left = total - snackTotal;
    cards.forEach((card, i) => {
      const small = card.querySelector('small');
      const calories = number(card.dataset.pumpBaseCalories || small?.textContent);
      const protein = number(card.dataset.pumpBaseProtein || small?.textContent.split('·')[0]);
      card.dataset.pumpBaseCalories = calories; card.dataset.pumpBaseProtein = protein;
      card.dataset.pumpCalories = i === cards.length - 1 ? left : Math.round(calories / total * (total - snackTotal) / 10) * 10;
      left -= Number(card.dataset.pumpCalories);
      card.dataset.pumpProtein = Math.max(0, protein - Math.ceil(snackTotal ? snacks.slice(0, plan.snacks).reduce((s, x) => s + x.protein, 0) / cards.length : 0));
      if (small && !card.classList.contains('meal-done')) small.textContent = `כ־${card.dataset.pumpProtein} גרם חלבון · כ־${card.dataset.pumpCalories} קל׳`;
    });
  };
  const normalizeCore = async () => {
    const s = getSession(); if (!s) return;
    await Promise.all(coreCards().map((card, i) => api(`food_entries?user_id=eq.${s.user.id}&date=eq.${date()}&menu_key=eq.menu-${i}`, s.access_token, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ calories: Number(card.dataset.pumpCalories), protein: Number(card.dataset.pumpProtein) }) })));
  };
  const syncSnackCard = async (index, card) => {
    const s = getSession(); if (!s) return;
    const key = `pump-snack-${index}`, rows = await api(`food_entries?select=id,name,calories,protein&user_id=eq.${s.user.id}&date=eq.${date()}&menu_key=eq.${key}`, s.access_token);
    const saved = rows?.[0]; if (!saved) return;
    card.classList.add('meal-done');
    card.querySelector('h3').textContent = saved.name;
    card.querySelector('small').textContent = `כ־${saved.protein} גרם חלבון · כ־${saved.calories} קל׳`;
    card.querySelector('.meal-swap').remove();
    const button = card.querySelector('.meal-toggle');
    button.textContent = '✓ נאכל היום — ביטול';
    button.onclick = async () => {
      button.disabled = true;
      try { await api(`food_entries?id=eq.${saved.id}`, s.access_token, { method: 'DELETE' }); await api(`meal_actions?user_id=eq.${s.user.id}&date=eq.${date()}&meal_key=eq.${key}`, s.access_token, { method: 'DELETE' }); window.location.reload(); } catch (_) { button.disabled = false; button.textContent = 'שגיאה — נסו שוב'; }
    };
  };
  const addSnackCards = () => {
    try {
      const list = document.querySelector('.menu-list'); if (!list || list.querySelector('.pump-snack-meal')) return;
      const plan = inferPlan(); if (!plan?.snacks) return; distribute(plan);
      snacks.slice(0, plan.snacks).forEach((initial, index) => {
        let selected = initial;
        const card = document.createElement('article'); card.className = 'pump-snack-meal';
        card.innerHTML = `<div class="menu-meta"><b>ארוחת ביניים ${index + 1}</b><span>חלופה 1 מתוך 3</span></div><p class="meal-label">${index ? 'סוגרים את הפער עד לארוחה הבאה' : 'שומרים על שובע בין הארוחות'}</p><h3>${selected.title}</h3><p>${selected.detail}</p><small>כ־${selected.protein} גרם חלבון · כ־${selected.calories} קל׳</small><div class="meal-buttons"><button class="meal-swap" type="button">↻ החלפה</button><button class="meal-toggle" type="button">✓ אכלתי</button></div>`;
        card.querySelector('.meal-swap').onclick = () => { selected = snacks[(snacks.indexOf(selected) + 1) % snacks.length]; card.querySelector('h3').textContent = selected.title; card.querySelector('h3').nextElementSibling.textContent = selected.detail; card.querySelector('small').textContent = `כ־${selected.protein} גרם חלבון · כ־${selected.calories} קל׳`; };
        card.querySelector('.meal-toggle').onclick = async () => {
          const s = getSession(), button = card.querySelector('.meal-toggle'); if (!s) { button.textContent = 'יש להתחבר מחדש'; return; }
          button.disabled = true; button.textContent = 'שומרים…';
          try {
            const key = `pump-snack-${index}`, day = date();
            await api(`food_entries?user_id=eq.${s.user.id}&date=eq.${day}&menu_key=eq.${key}`, s.access_token, { method: 'DELETE' });
            await api('food_entries', s.access_token, { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: s.user.id, date: day, name: selected.title, calories: selected.calories, protein: selected.protein, menu_key: key }) });
            await api('meal_actions?on_conflict=user_id,date,meal_key', s.access_token, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: s.user.id, date: day, meal_key: key, status: 'done', selected_option: 0 }) });
            await normalizeCore(); window.setTimeout(() => window.location.reload(), 250);
          } catch (_) { button.disabled = false; button.textContent = 'שגיאה — נסו שוב'; }
        };
        list.append(card);
        syncSnackCard(index, card).catch(() => {});
      });
    } catch (_) { /* The screen stays usable even if this optional enhancement fails. */ }
  };

  const exerciseNames = {
    'רגליים': { gym: 'רגליים · לחיצת רגליים במכונה', home: 'רגליים · סקוואט לכיסא' },
    'חזה וידיים': { gym: 'חזה וידיים · לחיצת חזה במכונה', home: 'חזה וידיים · שכיבות סמיכה בשיפוע' },
    'גב': { gym: 'גב · פולי עליון או חתירה במכונה', home: 'גב · חתירה עם משקולת או גומייה' },
    'רגליים וישבן': { gym: 'רגליים וישבן · דדליפט רומני / כפיפת רגליים', home: 'רגליים וישבן · הרמת אגן בשכיבה' },
    'כתפיים': { gym: 'כתפיים · לחיצת כתפיים במכונה', home: 'כתפיים · לחיצת כתפיים עם משקולות' },
    'בטן': { gym: 'בטן · פלאנק או דד־באג', home: 'בטן · פלאנק או דד־באג' }
  };

  const improveTraining = () => {
    document.querySelectorAll('.exercise-list article').forEach((card) => {
      const title = card.querySelector('b');
      if (!title || title.dataset.pumpExercise) return;
      const original = title.textContent.trim();
      const map = exerciseNames[original];
      if (!map) return;
      const isGym = card.textContent.includes('מכונה') || card.textContent.includes('פולי') || card.textContent.includes('ידיות');
      title.textContent = isGym ? map.gym : map.home;
      title.dataset.pumpExercise = 'true';
    });
  };

  const improveToday = () => {
    const daily = document.querySelector('.daily-card');
    if (!daily || daily.querySelector('.pump-daily-progress')) return;
    const ring = daily.querySelector('.goal-ring');
    if (!ring) return;
    const calories = ring.querySelector('strong')?.textContent || '0';
    const label = ring.querySelector('small')?.textContent || 'נאכלו';
    const summary = document.createElement('div');
    summary.className = 'pump-daily-progress';
    summary.innerHTML = `<small>המעקב שלך היום</small><b>${calories} <em>קל׳ ${label}</em></b><span>הנתונים מתעדכנים בכל ארוחה שתסמן/י.</span>`;
    ring.replaceWith(summary);
    daily.querySelector('.water')?.remove();
    daily.querySelector('.metrics span:last-child')?.remove();
  };

  const style = document.createElement('style');
  style.textContent = `
    .pump-meal-structure{margin:0 0 18px;padding:16px;border:1px solid #ff6b0066;border-radius:18px;background:linear-gradient(135deg,#191919,#121212)}
    .pump-meal-structure h2{margin:2px 0 6px;font-size:24px;line-height:1.18}.pump-meal-intro{margin:0 0 14px;color:#aaa;font-size:13px;line-height:1.45}
    .pump-meal-question{margin:13px 0}.pump-meal-question p{margin:0 0 7px;font-size:13px;font-weight:800}.pump-meal-choices{display:flex;flex-wrap:wrap;gap:7px}
    .pump-meal-choices button{border:1px solid #373737;border-radius:999px;background:#222;color:#eaeaea;padding:8px 10px;font:inherit;font-size:12px}.pump-meal-choices button.active{border-color:#ff6b00;background:#ff6b001a;color:#ff9c56}
    .pump-meal-result{display:grid;gap:4px;margin-top:15px;padding:12px;border-radius:13px;background:#18251c;border:1px solid #24c66b66}.pump-meal-result small{color:#7ee4a5}.pump-meal-result b{color:#fff;font-size:16px}.pump-meal-result span{color:#b7c8bb;font-size:12px;line-height:1.4}
    .pump-meal-source-hidden{display:none!important}.pump-snack-meal button:disabled{opacity:.65}
    .pump-daily-progress{display:grid;gap:3px;min-width:142px;padding:12px 13px;border:1px solid #ff6b005c;border-radius:14px;background:linear-gradient(135deg,#21160e,#15110d);text-align:right}.pump-daily-progress small{color:#ffad75;font-size:11px}.pump-daily-progress b{color:#fff;font-size:19px}.pump-daily-progress b em{font-style:normal;font-size:11px;color:#e7c8b4}.pump-daily-progress span{color:#a9a09a;font-size:10px;line-height:1.35}
  `;
  document.head.append(style);

  document.addEventListener('click', (event) => {
    const text = event.target.closest('button')?.textContent || '';
    const goal = text.includes('עלייה במשקל') ? 'gain' : text.includes('ירידה במשקל') ? 'lose' : text.includes('הכנה לאירוע') ? 'event' : null;
    if (goal) write({ ...read(), goal });
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-list > article:not(.pump-snack-meal) .meal-toggle');
    if (!button?.textContent.includes('אכלתי')) return;
    window.setTimeout(() => normalizeCore().catch(() => {}), 700);
  }, true);
  const refresh = () => { mountOnboarding(); improveSummary(); improveNutrition(); addSnackCards(); improveTraining(); improveToday(); };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  refresh();
})();
