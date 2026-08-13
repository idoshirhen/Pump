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

    sourceLabel.hidden = true;
    sourceList.hidden = true;
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
    const menuList = document.querySelector('.menu-list');
    if (!menuList || document.querySelector('.pump-snack-plan')) return;
    const plan = inferPlan();
    const snack = document.createElement('section');
    snack.className = 'snack-card pump-snack-plan';
    const examples = plan.snacks === 2
      ? 'ביניים 1: פרי עם יוגורט/סקיר או חופן אגוזים. ביניים 2: כריך קטן עם חלבון, מעדן חלבון או שייק.'
      : 'פרי עם יוגורט/סקיר, חופן אגוזים, כריך קטן עם חלבון או שייק.';
    snack.innerHTML = `<span>✦</span><div><b>${plan.snacks} ארוחות ביניים היום</b><p>${examples}</p></div>`;
    menuList.after(snack);
    const count = document.querySelector('.menu-title b');
    if (count) count.textContent = plan.meals;
  };

  const style = document.createElement('style');
  style.textContent = `
    .pump-meal-structure{margin:0 0 18px;padding:16px;border:1px solid #ff6b0066;border-radius:18px;background:linear-gradient(135deg,#191919,#121212)}
    .pump-meal-structure h2{margin:2px 0 6px;font-size:24px;line-height:1.18}.pump-meal-intro{margin:0 0 14px;color:#aaa;font-size:13px;line-height:1.45}
    .pump-meal-question{margin:13px 0}.pump-meal-question p{margin:0 0 7px;font-size:13px;font-weight:800}.pump-meal-choices{display:flex;flex-wrap:wrap;gap:7px}
    .pump-meal-choices button{border:1px solid #373737;border-radius:999px;background:#222;color:#eaeaea;padding:8px 10px;font:inherit;font-size:12px}.pump-meal-choices button.active{border-color:#ff6b00;background:#ff6b001a;color:#ff9c56}
    .pump-meal-result{display:grid;gap:4px;margin-top:15px;padding:12px;border-radius:13px;background:#18251c;border:1px solid #24c66b66}.pump-meal-result small{color:#7ee4a5}.pump-meal-result b{color:#fff;font-size:16px}.pump-meal-result span{color:#b7c8bb;font-size:12px;line-height:1.4}
  `;
  document.head.append(style);

  document.addEventListener('click', (event) => {
    const text = event.target.closest('button')?.textContent || '';
    const goal = text.includes('עלייה במשקל') ? 'gain' : text.includes('ירידה במשקל') ? 'lose' : text.includes('הכנה לאירוע') ? 'event' : null;
    if (goal) write({ ...read(), goal });
  });

  const refresh = () => { mountOnboarding(); improveSummary(); improveNutrition(); };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  refresh();
})();
