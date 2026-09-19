(() => {
  const STORAGE_KEY = 'pump-language-v1';
  const LANGS = new Set(['he', 'en']);
  let lang = LANGS.has(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : 'he';
  const originals = new WeakMap();
  let observer;
  let translating = false;

  const exact = new Map(Object.entries({
    'היום':'Today','תזונה':'Nutrition','כושר':'Training','התקדמות':'Progress','צילום אוכל':'Food camera',
    'החשבון שלי':'My account','עריכת המסלול והיעד':'Edit plan and goal','התנתקות':'Log out',
    'איפוס נתוני משתמש':'Reset user data','מחיקת משתמש':'Delete account','שפה':'Language',
    'עברית':'Hebrew','אנגלית':'English','הגדרות שפה':'Language settings',
    'יוצאים לדרך':'Get started','כבר יש לי חשבון':'I already have an account','טוב שחזרת':'Welcome back',
    'מתחילים ביחד':'Let’s get started','כניסה לחשבון':'Sign in','יצירת חשבון':'Create account','אימייל':'Email','סיסמה':'Password',
    'כניסה':'Sign in','אין לך חשבון? יוצרים אחד':'No account yet? Create one','כבר יש חשבון? נכנסים':'Already have an account? Sign in',
    'מסלול לפי המטרה':'A plan built around your goal','תזונה ואימונים':'Nutrition and training','מעקב שבועי':'Weekly tracking',
    'ירידה או עלייה, בהתאם לנתונים שלך':'Lose or gain based on your data','מסגרת שמתאימה לזמן ולמקום שלך':'A framework that fits your time and routine',
    'משנים כיוון לפי ההתקדמות האמיתית':'Adjust based on real progress','מטרה':'Goal','נתונים':'Details','קצב':'Pace','אימונים':'Training','שגרה':'Routine','דיוק':'Personalization','מסלול':'Plan',
    'חזרה':'Back','המשך':'Continue','אישור המסלול':'Confirm plan','בונים את המסלול…':'Building your plan…',
    'ירידה במשקל':'Weight loss','עלייה במשקל':'Weight gain','הכנה לאירוע':'Event goal','אני אישה':'I’m a woman','אני גבר':'I’m a man',
    'איך קוראים לך?':'What’s your name?','גיל':'Age','גובה (ס״מ)':'Height (cm)','משקל נוכחי (ק״ג)':'Current weight (kg)','משקל יעד':'Goal weight',
    'מתון ויציב':'Steady','ממוקד יותר':'More focused','מעט תנועה':'Low activity','תנועה קלה':'Light activity','פעיל/ה':'Active',
    'מתחיל/ה':'Beginner','חוזר/ת להתאמן':'Returning','מתאמן/ת קבוע':'Experienced','בבית':'At home','בחדר כושר':'At the gym','גם וגם':'Both',
    'כרגע לא':'Not now','רעב ונשנושים':'Hunger & snacking','קשה להתמיד':'Consistency is hard','אין זמן':'Not enough time','לא יודע/ת מאיפה להתחיל':'Not sure where to start',
    'פחות מ־6':'Under 6','6–7':'6–7','7+':'7+','כן':'Yes','לא':'No','יש העדפות אוכל שחשוב שנכיר?':'Any food preferences we should know about?',
    'מבנה הארוחות שלך':'Your meal structure','2 ארוחות':'2 meals','3 ארוחות':'3 meals','גמיש':'Flexible',
    'יעד יומי משוער':'Estimated daily target','יעד חלבון':'Protein target','קצב משוער':'Estimated pace','כך המסלול נבנה עבורך':'How your plan was built',
    'נאכלו היום':'Consumed today','חלבון':'Protein','כוסות מים':'Glasses of water','היעד שלך':'Your goal','משקל נוכחי':'Current weight','צפי יעד':'Estimated goal date','אימון היום':'Today’s workout','בוצע ✓':'Done ✓','טרם סומן':'Not done yet',
    'להיום':'For today','שלושה צעדים אישיים':'Three personal steps','ארוחה נוספת':'Extra meal','אימון כוח או תנועה':'Strength workout or movement','תנועה קלה':'Light movement','צ׳ק־אין ערב':'Evening check-in',
    'המסלול שלך אומר:':'Your plan says:','תזונה מותאמת':'Personalized nutrition','כושר מותאם':'Personalized training','התקדמות אמיתית':'Real progress',
    'נותרו היום:':'Remaining today:','התפריט שלך להיום':'Your menu for today','מה נאכל':'What you ate','כשאין זמן או עולה רעב':'When you’re short on time or hungry',
    'הוספה ידנית':'Manual entry','צילום אוכל':'Food camera','החלפה':'Swap','אכלתי':'I ate this','נאכל היום — ביטול':'Eaten today — undo','איך היתה הארוחה?':'How was the meal?','איך הייתה הארוחה?':'How was the meal?',
    'אהבתי':'Liked it','לא רוצה שוב':'Don’t show again','יקר לי':'Too expensive','מסובך / לקח זמן':'Too complicated / slow','לא השביע אותי':'Still hungry',
    'נשמר להיום':'Saved today','ארוחות':'meals','ארוחה':'meal','נאכל':'eaten','נותר':'remaining','דולג':'skipped','חלופה':'Option',
    'תוכנית אימונים':'Workout plan','חלוקת השבוע':'Weekly schedule','אימון A':'Workout A','אימון B':'Workout B','סיימתי אימון היום':'I finished today’s workout','אימון סומן להיום':'Workout marked done',
    'איך מתקדמים:':'How to progress:','למה:':'Why:','הסבר:':'Explanation:','רגליים':'Legs','חזה וידיים':'Chest & arms','גב':'Back','כתפיים':'Shoulders','ידיים':'Arms','בטן':'Core','ישבן':'Glutes','חזה':'Chest','ליבה':'Core',
    'מסתכלים על':'Focus on','המגמה, לא על יום.':'the trend, not one day.','המדד שלך':'Your metric','שקילות':'Weigh-ins','שקילה ביום ב׳':'Weigh in on Monday','+ שקילה':'+ Weigh-in',
    'רוצים להבין':'Want to understand','מה יש בצלחת?':'what’s on your plate?','צלמו או העלו תמונה':'Take or upload a photo','חשוב שהצלחת תהיה מוארת וברורה':'Make sure the plate is well lit and clear','מצלמה':'Camera','בחירה מהגלריה':'Choose from gallery','צילום מחדש':'Retake photo','הסרת התמונה':'Remove photo','ניתוח האוכל':'Analyze food','מנתחים את הארוחה…':'Analyzing meal…','מסתכלים על הצלחת':'Looking at your plate','בדקו לפני שמוסיפים':'Review before adding','שם הארוחה':'Meal name','קלוריות':'Calories','פחמימות':'Carbs','שומן':'Fat','זוהה בצלחת:':'Detected on plate:','הוספה להיום':'Add to today','מוסיפים למעקב…':'Adding…','צלמו מחדש':'Retake photo','כדי שנדייק:':'For better accuracy:',
    'הוספה למעקב':'Add to tracking','מה אכלת?':'What did you eat?','שם הארוחה או המאכל':'Meal or food name','חלבון (גרם)':'Protein (g)','מוסיפים…':'Adding…',
    'שקילת יום שני':'Monday weigh-in','מה המשקל שלך הבוקר?':'What’s your weight this morning?','שמירת שקילה':'Save weigh-in','סיכום יומי':'Daily summary','איך הרגיש לך היום?':'How did today feel?','קשה':'Hard','בסדר':'Okay','מעולה':'Great','סיימתי להיום':'Done for today',
    'קלוריות שנרשמו':'Calories logged','גרם חלבון':'g protein','ארוחות מתוכננות':'planned meals','לא הצלחנו לטעון את החשבון. נסו לרענן.':'Could not load your account. Please refresh.',
    'החלפנו לאפשרות אחרת.':'Switched to another option.','הארוחה נוספה למעקב של היום.':'Meal added to today’s tracking.','הארוחה חזרה לתכנון של היום.':'Meal returned to today’s plan.','הארוחה הוסרה מהיום.':'Meal removed from today.',
    'למדנו שאהבת את המנה ונעדיף גם מנות דומות.':'Got it — we’ll prioritize this meal and similar ones.','לא נציע את המנה הזאת שוב.':'We won’t suggest this meal again.','נעדיף בהמשך מנות נגישות וחסכוניות יותר.':'We’ll favor more budget-friendly meals.','נעדיף בהמשך מנות מהירות ופשוטות יותר.':'We’ll favor quicker, simpler meals.','נעדיף בהמשך מנות משביעות ועשירות יותר בחלבון.':'We’ll favor more filling, protein-rich meals.',
    'הפעם':'This time','עושים את זה.':'we make it happen.','המידע באפליקציה כללי ואינו מחליף ייעוץ רפואי או תזונתי אישי.':'Information in the app is general and does not replace personal medical or nutritional advice.'
  }));

  const replacements = [
    [/שלב\s+(\d+)\s+מתוך\s+(\d+)/g, 'Step $1 of $2'],
    [/כ־([\d.]+)\s*ק״ג בשבוע/g, 'about $1 kg/week'],
    [/כ־(\d+)–(\d+)\s+חודשים/g, 'about $1–$2 months'],
    [/כ־(\d+)\s+חודשים/g, 'about $1 months'],
    [/(\d+)\s+אימונים בשבוע/g, '$1 workouts/week'],
    [/(\d+)\s+ק״ג נשארו/g, '$1 kg remaining'],
    [/(\d+(?:\.\d+)?)\s+ק״ג/g, '$1 kg'],
    [/(\d+)\s+קל׳/g, '$1 cal'],
    [/כ־(\d+)\s+קל׳/g, 'about $1 cal'],
    [/כ־(\d+)\s+גרם חלבון/g, 'about $1 g protein'],
    [/(\d+)\s+גרם חלבון/g, '$1 g protein'],
    [/(\d+)\s+גרם/g, '$1 g'],
    [/מנוחה\s+(\d+)–(\d+)\s+שנ׳/g, 'rest $1–$2 sec'],
    [/(\d+)\s+סטים של\s+(\d+)–(\d+)/g, '$1 sets of $2–$3'],
    [/(\d+)–(\d+)\s+סטים של\s+(\d+)–(\d+)/g, '$1–$2 sets of $3–$4'],
    [/יום\s+(\d+):\s+אימון\s+([AB])/g, 'Day $1: Workout $2'],
    [/חלופה\s+(\d+)\s+מתוך\s+(\d+)/g, 'Option $1 of $2'],
    [/(\d+)\s+נאכלו/g, '$1 eaten'],
    [/מתוך\s+(\d+)/g, 'of $1'],
    [/נותרו היום:\s*/g, 'Remaining today: '],
    [/צפי יעד:\s*/g, 'Estimated goal: '],
    [/מסלול\s+ירידה במשקל/g, 'Weight-loss plan'],
    [/מסלול\s+עלייה במשקל/g, 'Weight-gain plan'],
    [/מסלול\s+הכנה לאירוע/g, 'Event plan'],
    [/בבית ובחדר כושר/g, 'at home and at the gym'],
    [/בחדר כושר/g, 'at the gym'],
    [/בבית/g, 'at home'],
    [/קל׳/g, 'cal'],[/ק״ג/g, 'kg'],[/גרם/g, 'g'],[/דק׳/g, 'min'],[/שנ׳/g, 'sec'],
    [/יום ראשון/g,'Sunday'],[/יום שני/g,'Monday'],[/יום שלישי/g,'Tuesday'],[/יום רביעי/g,'Wednesday'],[/יום חמישי/g,'Thursday'],[/יום שישי/g,'Friday'],[/יום שבת/g,'Saturday'],
    [/ינואר/g,'January'],[/פברואר/g,'February'],[/מרץ/g,'March'],[/אפריל/g,'April'],[/מאי/g,'May'],[/יוני/g,'June'],[/יולי/g,'July'],[/אוגוסט/g,'August'],[/ספטמבר/g,'September'],[/אוקטובר/g,'October'],[/נובמבר/g,'November'],[/דצמבר/g,'December'],
    [/בוקר טוב/g,'Good morning'],[/צהריים טובים/g,'Good afternoon'],[/ערב טוב/g,'Good evening'],[/לילה טוב/g,'Good night'],
    [/אורז/g,'rice'],[/עוף/g,'chicken'],[/חזה עוף/g,'chicken breast'],[/טונה/g,'tuna'],[/טופו/g,'tofu'],[/סלמון/g,'salmon'],[/ביצים/g,'eggs'],[/ביצה/g,'egg'],[/קוטג׳/g,'cottage cheese'],[/יוגורט/g,'yogurt'],[/סקיר/g,'skyr'],[/שיבולת שועל/g,'oats'],[/סלט/g,'salad'],[/טחינה/g,'tahini'],[/לחם מלא/g,'whole-grain bread'],[/לחם/g,'bread'],[/פיתה/g,'pita'],[/פסטה/g,'pasta'],[/עדשים/g,'lentils'],[/חומוס/g,'hummus'],[/תפוחי אדמה/g,'potatoes'],[/תפוח אדמה/g,'potato'],[/ירקות/g,'vegetables'],[/פרי/g,'fruit'],[/בננה/g,'banana'],[/אגוזים/g,'nuts'],[/גבינה/g,'cheese'],[/בקר/g,'beef'],[/קציצות/g,'meatballs'],[/שקשוקה/g,'shakshuka'],[/כריך/g,'sandwich'],[/דייסת/g,'porridge'],[/שייק חלבון/g,'protein shake'],[/שייק/g,'shake'],[/קרקרים/g,'crackers'],[/מג׳דרה/g,'mujaddara'],[/בולגרית/g,'feta'],
    [/עם/g,'with'],[/ו־/g,'and '],[/ ו/g,' and '],[/או/g,'or'],[/גדול/g,'large'],[/גדולה/g,'large'],[/מבושל/g,'cooked'],[/מבושלת/g,'cooked'],[/אפוי/g,'baked'],[/אפויה/g,'baked'],[/מלא/g,'whole-grain'],[/מהיר/g,'quick'],[/קלה/g,'light']
  ];

  const attrs = ['placeholder','aria-label','title','alt'];

  function englishify(input) {
    if (!input) return input;
    const trimmed = input.trim();
    let value = exact.get(trimmed) || input;
    for (const [re, rep] of replacements) value = value.replace(re, rep);
    value = value.replace(/\s{2,}/g, ' ');
    return value;
  }

  function remember(node, value) {
    if (!originals.has(node)) originals.set(node, value);
  }

  function translateTextNode(node) {
    const value = node.nodeValue;
    if (!value || !value.trim()) return;
    remember(node, value);
    const original = originals.get(node);
    node.nodeValue = lang === 'en' ? englishify(original) : original;
  }

  function translateElement(el) {
    if (!(el instanceof Element)) return;
    attrs.forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const key = { el, attr };
      const datasetKey = 'pumpI18n' + attr.replace(/[^a-z]/gi,'');
      if (!el.dataset[datasetKey]) el.dataset[datasetKey] = el.getAttribute(attr) || '';
      const original = el.dataset[datasetKey];
      el.setAttribute(attr, lang === 'en' ? englishify(original) : original);
    });
    if (el.hasAttribute('dir')) el.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
  }

  function walk(root = document.body) {
    if (!root) return;
    translating = true;
    try {
      if (root.nodeType === Node.TEXT_NODE) translateTextNode(root);
      if (root.nodeType === Node.ELEMENT_NODE) translateElement(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else translateElement(node);
      }
    } finally { translating = false; }
  }

  function applyDocumentLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.body?.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.body?.classList.toggle('pump-lang-en', lang === 'en');
    document.body?.classList.toggle('pump-lang-he', lang === 'he');
    document.querySelectorAll('[dir]').forEach((el) => el.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl'));
  }

  function makeLanguageSetting() {
    const settings = document.querySelector('.screen .settings');
    if (!settings || settings.querySelector('.pump-language-setting')) return;
    const wrap = document.createElement('div');
    wrap.className = 'pump-language-setting';
    wrap.innerHTML = `
      <div class="pump-language-setting__title"><span>🌐</span><b>${lang === 'en' ? 'Language' : 'שפה'}</b></div>
      <div class="pump-language-setting__buttons" role="group" aria-label="Language">
        <button type="button" data-lang="he">עברית</button>
        <button type="button" data-lang="en">English</button>
      </div>`;
    wrap.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === lang);
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });
    settings.insertBefore(wrap, settings.firstChild);
  }

  function refreshLanguageSetting() {
    const wrap = document.querySelector('.pump-language-setting');
    if (!wrap) return;
    const title = wrap.querySelector('b');
    if (title) title.textContent = lang === 'en' ? 'Language' : 'שפה';
    wrap.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === lang);
      if (button.dataset.lang === 'he') button.textContent = lang === 'en' ? 'Hebrew' : 'עברית';
      if (button.dataset.lang === 'en') button.textContent = 'English';
    });
  }

  function setLanguage(next) {
    if (!LANGS.has(next) || next === lang) return;
    lang = next;
    localStorage.setItem(STORAGE_KEY, lang);
    applyDocumentLanguage();
    walk(document.body);
    makeLanguageSetting();
    refreshLanguageSetting();
    window.dispatchEvent(new CustomEvent('pump-language:change', { detail: { language: lang } }));
  }

  function refresh(root = document.body) {
    applyDocumentLanguage();
    makeLanguageSetting();
    walk(root);
    refreshLanguageSetting();
  }

  function installStyles() {
    if (document.getElementById('pump-i18n-style')) return;
    const style = document.createElement('style');
    style.id = 'pump-i18n-style';
    style.textContent = `
      .pump-language-setting{padding:14px 16px;margin:0 0 10px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.025)}
      .pump-language-setting__title{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:15px}
      .pump-language-setting__buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .pump-language-setting__buttons button{min-height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#1a1a1a;color:#fff;font-weight:700}
      .pump-language-setting__buttons button.active{border-color:#ff6b00;background:rgba(255,107,0,.14);color:#ff8a3d}
      body.pump-lang-en .screen,body.pump-lang-en .onboarding-body,body.pump-lang-en .auth-modal,body.pump-lang-en .small-modal{text-align:left}
      body.pump-lang-en .bottom-nav,body.pump-lang-en .app-top,body.pump-lang-en .settings{direction:ltr}
      body.pump-lang-en .menu-meta,body.pump-lang-en .daily-head,body.pump-lang-en .section-title,body.pump-lang-en .account-card{direction:ltr}
      body.pump-lang-en input,body.pump-lang-en textarea{direction:ltr;text-align:left}
    `;
    document.head.appendChild(style);
  }

  window.PUMP_I18N = { getLanguage: () => lang, setLanguage, translate: englishify };

  const start = () => {
    installStyles();
    refresh();
    observer = new MutationObserver((mutations) => {
      if (translating) return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) refresh(node);
        });
      }
      makeLanguageSetting();
      refreshLanguageSetting();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();