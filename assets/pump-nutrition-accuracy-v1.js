/* PUMP nutrition accuracy layer v2
   Single-source meal math for the rendered PUMP menu.
   Conventions:
   - weights shown for rice/pasta/potato/legumes/meat/fish are ready-to-eat/cooked unless named otherwise
   - plain "טחינה" means prepared tahini sauce; raw paste must say "טחינה גולמית"
   - plain "חומוס" means prepared hummus spread; cooked chickpeas must say "חומוס מבושל" / "גרגירי חומוס"
   - displayed calories/protein are always recalculated from the quantities actually shown
   - protein/energy boosters are merged into the meal quantities instead of shown as separate instructions
*/
(() => {
  'use strict';

  const mealNutrition = new Map();

  const PER_GRAM = [
    [/טחינה גולמית/i, 5.95, 0.17],
    [/טחינה/i, 2.40, 0.08],
    [/שמן זית|שמן שומשום/i, 8.84, 0],
    [/חמאת בוטנים/i, 5.88, 0.25],
    [/אגוז/i, 6.20, 0.15],
    [/שקדים/i, 5.79, 0.21],
    [/חזה עוף|עוף מבושל|עוף מתובל/i, 1.65, 0.31],
    [/פרגי/i, 2.09, 0.26],
    [/קציצות הודו/i, 1.90, 0.24],
    [/הודו/i, 1.70, 0.29],
    [/קציצות בקר|קציצת בקר/i, 2.15, 0.24],
    [/בקר טחון|בקר רזה|בקר/i, 2.10, 0.26],
    [/סלמון/i, 2.08, 0.20],
    [/דג לבן/i, 1.28, 0.26],
    [/דג בתנור/i, 1.45, 0.25],
    [/טונה.*מים/i, 1.16, 0.26],
    [/טונה/i, 1.30, 0.26],
    [/טופו/i, 1.44, 0.17],
    [/תחליף עוף.*סויה/i, 1.65, 0.18],
    [/אדממה/i, 1.21, 0.12],
    [/קוטג.*5/i, 1.03, 0.11],
    [/גבינה לבנה.*5|גבינה 5/i, 1.05, 0.11],
    [/גבינה צהובה.*9/i, 2.60, 0.30],
    [/גבינה בולגרית.*5|גבינה מלוחה.*5/i, 1.55, 0.14],
    [/יוגורט עשיר בחלבון|יוגורט PRO|סקיר/i, 0.70, 0.10],
    [/יוגורט טבעי/i, 0.62, 0.035],
    [/יוגורט סויה/i, 0.65, 0.04],
    [/משקה סויה/i, 0.43, 0.033],
    [/אורז.*מבושל|אורז מוכן/i, 1.30, 0.027],
    [/פתיתים.*מבושל/i, 1.55, 0.052],
    [/פסטת עדשים.*מבושל/i, 1.45, 0.09],
    [/פסטה.*מבושל/i, 1.57, 0.058],
    [/קוסקוס.*מבושל/i, 1.12, 0.038],
    [/בורגול.*מבושל/i, 0.83, 0.031],
    [/קינואה.*מבושל/i, 1.20, 0.044],
    [/מג.?דרה.*מבושל/i, 1.35, 0.055],
    [/עדשים.*מבושל/i, 1.16, 0.09],
    [/חומוס מבושל|גרגירי חומוס/i, 1.64, 0.089],
    [/חומוס/i, 2.40, 0.08],
    [/פול.*מבושל/i, 1.10, 0.076],
    [/שעועית.*מבושל/i, 1.27, 0.087],
    [/מרק שעועית/i, 0.75, 0.04],
    [/קציצות עדשים/i, 1.65, 0.085],
    [/פלאפל אפוי/i, 2.30, 0.11],
    [/תירס/i, 0.96, 0.034],
    [/תפוחי? אדמה.*אפוי|תפוחי? אדמה/i, 0.93, 0.025],
    [/בטטה/i, 0.90, 0.02],
    [/שיבולת שועל/i, 3.79, 0.13],
    [/מוזלי/i, 3.70, 0.10],
    [/רוטב שקשוקה|רוטב עגבניות/i, 0.45, 0.015],
    [/שמרי בירה/i, 3.25, 0.45],
    [/זיתים/i, 1.45, 0.01],
    [/ענבים/i, 0.69, 0.007],
  ];

  const PER_UNIT = [
    [/^ביצים?$|ביצה קשה|ביצים קשות/i, 72, 6.3],
    [/לחם מלא/i, 78, 3.6],
    [/פיתה מלאה קטנה/i, 170, 5.8],
    [/פיתה מלאה/i, 240, 8.5],
    [/לחמנייה מלאה/i, 210, 8.0],
    [/טורטייה.*מלאה/i, 180, 5.5],
    [/פריכיות אורז/i, 35, 0.7],
    [/קרקרים מלאים/i, 35, 0.8],
    [/מעדן חלבון/i, 145, 20],
    [/תמרים/i, 66, 0.4],
    [/תפוח$/i, 95, 0.5],
    [/בננה/i, 105, 1.3],
    [/פרי טרי|ענבים או פרי/i, 80, 1.0],
  ];

  const normalize = (s) => String(s || '').replace(/[״׳]/g, "'").replace(/\s+/g, ' ').trim();

  function vegNutrition(name, amount, unit) {
    if (/לימון|קינמון|זעתר|קורט/i.test(name)) return { calories: 2, protein: 0, known: true };
    if (/קערה/i.test(unit)) return { calories: 35 * amount, protein: 1.5 * amount, known: true };
    if (/גרם/i.test(unit)) return { calories: 0.25 * amount, protein: 0.012 * amount, known: true };
    return { calories: 25 * amount, protein: 1 * amount, known: true };
  }

  function nutritionFor(name, amount, unit) {
    const n = normalize(name);
    const u = normalize(unit);
    if (/סלט|ירקות|עגבני|מלפפון|חמוצים/i.test(n)) return vegNutrition(n, amount, u);
    if (/מנה|קורט/.test(u)) return { calories: /לימון|קינמון|זעתר/i.test(n) ? 2 : 0, protein: 0, known: true };
    if (/כפית/.test(u)) return nutritionFor(n, amount * 5, 'גרם');
    if (/כף/.test(u)) return nutritionFor(n, amount * 15, 'גרם');
    if (/יח|פרוס/.test(u)) {
      const row = PER_UNIT.find(([re]) => re.test(n));
      if (row) return { calories: row[1] * amount, protein: row[2] * amount, known: true };
    }
    if (/גרם/.test(u)) {
      const row = PER_GRAM.find(([re]) => re.test(n));
      if (row) return { calories: row[1] * amount, protein: row[2] * amount, known: true };
    }
    return { calories: 0, protein: 0, known: false };
  }

  function parseIngredient(text) {
    const clean = normalize(text).replace(/^ו(?=\S)/, '');
    if (/^כפית\s+שמן זית/i.test(clean)) return { amount: 1, unit: 'כפית', name: 'שמן זית', raw: text };
    const m = clean.match(/^([\d.]+)\s*(גרם|יח'?|פרוסות?|כף|כפית|קערה|מנה|קורט)\s+(.+)$/i);
    if (!m) return null;
    return { amount: Number(m[1]), unit: m[2], name: m[3], raw: text };
  }

  function splitDetail(detail) {
    const text = normalize(detail);
    const start = text.match(/(?:כמות מוצעת|כמות מדויקת|כמות):\s*(.*)$/);
    if (!start) return null;
    const pieces = start[1].split(/\s*·\s*/);
    const items = [];
    for (let part of pieces) {
      part = part.replace(/^להשלמת החלבון:\s*/i, '').replace(/^להשלמת (?:יעד )?האנרגיה:\s*/i, '');
      const parsed = parseIngredient(part);
      if (parsed) items.push(parsed);
    }
    return items.length ? items : null;
  }

  function calc(items) {
    return items.reduce((sum, item) => {
      const n = nutritionFor(item.name, item.amount, item.unit);
      return { calories: sum.calories + n.calories, protein: sum.protein + n.protein, known: sum.known && n.known };
    }, { calories: 0, protein: 0, known: true });
  }

  function practicalValues(item, current) {
    const u = normalize(item.unit);
    const n = normalize(item.name);
    if (/גרם/.test(u)) {
      const fine = /טחינה|שמן|חמאת בוטנים|אגוז|שקדים/i.test(n);
      const step = fine ? 5 : 10;
      const min = fine ? 5 : 40;
      const max = /עוף|פרג|הודו|בקר|דג|טונה|טופו|קוטג|גבינה/i.test(n) ? 300 : 450;
      const center = Math.max(min, Math.min(max, current));
      const vals = [];
      for (let d = -120; d <= 180; d += step) {
        const v = Math.round((center + d) / step) * step;
        if (v >= min && v <= max) vals.push(v);
      }
      return [...new Set(vals)];
    }
    if (/יח|פרוס/.test(u)) {
      const wholeOnly = /תמר|פריכ|קרקר|ביצה|פיתה|לחמנייה|טורטייה|מעדן|פרי|תפוח|בננה/i.test(n);
      const vals = [];
      for (let v = wholeOnly ? 1 : 0.5; v <= (/פרוס|פריכ|קרקר/.test(u + n) ? 6 : 4); v += wholeOnly ? 1 : 0.5) vals.push(v);
      return vals;
    }
    return [current];
  }

  function isProtein(item) {
    return /עוף|פרג|הודו|בקר|טונה|סלמון|דג|טופו|תחליף עוף|קוטג|גבינה|יוגורט|מעדן חלבון|ביצה|אדממה|עדשים|חומוס מבושל|שעועית/i.test(item.name);
  }
  function isCarb(item) {
    return /אורז|פתיתים|פסטה|קוסקוס|בורגול|קינואה|תפוח|בטטה|לחם|פיתה|לחמנייה|טורטייה|שיבולת|פריכ|קרקר/i.test(item.name);
  }
  function isFineEnergy(item) {
    return /טחינה|שמן|אגוז|שקד|חמאת בוטנים/i.test(item.name);
  }

  function score(totals, targetCalories, targetProtein, items, original) {
    const calErr = Math.abs(totals.calories - targetCalories) / Math.max(1, targetCalories);
    const proErr = targetProtein ? Math.max(0, targetProtein - totals.protein) / targetProtein : 0;
    let distortion = 0;
    items.forEach((x, i) => { distortion += Math.abs(x.amount - original[i].amount) / Math.max(1, original[i].amount); });
    return calErr * 8 + proErr * 5 + distortion * 0.05;
  }

  function tunePortions(input, targetCalories, targetProtein) {
    const base = input.map(x => ({ ...x }));
    if (!base.length || !calc(base).known) return { items: base, totals: calc(base), tuned: false };
    const adjustableIndexes = [];
    const p = base.findIndex(isProtein); if (p >= 0) adjustableIndexes.push(p);
    const c = base.findIndex((x, i) => i !== p && isCarb(x)); if (c >= 0) adjustableIndexes.push(c);
    const f = base.findIndex((x, i) => i !== p && i !== c && isFineEnergy(x)); if (f >= 0) adjustableIndexes.push(f);
    let best = base.map(x => ({...x}));
    let bestTotals = calc(best);
    let bestScore = score(bestTotals, targetCalories, targetProtein, best, base);
    const candidates = adjustableIndexes.map(i => practicalValues(base[i], base[i].amount));
    const recurse = (depth, working) => {
      if (depth === adjustableIndexes.length) {
        const totals = calc(working);
        if (!totals.known) return;
        const s = score(totals, targetCalories, targetProtein, working, base);
        if (s < bestScore) { bestScore = s; best = working.map(x => ({...x})); bestTotals = totals; }
        return;
      }
      const idx = adjustableIndexes[depth];
      for (const amount of candidates[depth]) {
        const next = working.map(x => ({...x}));
        next[idx].amount = amount;
        recurse(depth + 1, next);
      }
    };
    recurse(0, base);
    return { items: best, totals: bestTotals, tuned: true };
  }

  function formatIngredient(item) {
    const amount = Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1).replace(/\.0$/, '');
    return `${amount} ${item.unit} ${item.name}`;
  }

  function updateCard(article, index) {
    if (!article) return;
    const title = article.querySelector('h3')?.textContent?.trim();
    const detailNode = article.querySelector('h3 + p');
    const macroNode = article.querySelector('h3 + p + small');
    if (!title || !detailNode || !macroNode) return;
    const signature = `${title}|${detailNode.textContent}|${macroNode.textContent}`;
    if (article.dataset.pumpNutritionSignature === signature) return;
    const targetCaloriesMatch = macroNode.textContent.match(/(?:כ-?\s*)?([\d,]+)\s*קל/);
    const targetProteinMatch = macroNode.textContent.match(/(?:כ-?\s*)?([\d.]+)\s*גרם\s*חלבון/);
    if (!targetCaloriesMatch) return;
    const targetCalories = Number(targetCaloriesMatch[1].replace(/,/g, ''));
    const targetProtein = targetProteinMatch ? Number(targetProteinMatch[1]) : 0;
    const items = splitDetail(detailNode.textContent);
    if (!items) return;
    const result = tunePortions(items, targetCalories, targetProtein);
    if (!result.totals.known) { article.dataset.pumpNutritionSignature = signature; return; }
    const calories = Math.round(result.totals.calories);
    const protein = Math.round(result.totals.protein);
    detailNode.textContent = `כמות: ${result.items.map(formatIngredient).join(' · ')}`;
    macroNode.textContent = `${protein} גרם חלבון · ${calories.toLocaleString('he-IL')} קל׳`;
    macroNode.title = `מחושב מהכמויות שמופיעות בארוחה; יעד הארוחה הוא ${targetCalories.toLocaleString('he-IL')} קל׳.`;
    const menuKey = `menu-${index}`;
    mealNutrition.set(menuKey, { title, calories, protein });
    mealNutrition.set(`title:${title}`, { title, calories, protein });
    article.dataset.pumpCalculatedCalories = String(calories);
    article.dataset.pumpCalculatedProtein = String(protein);
    article.dataset.pumpNutritionSignature = `${title}|${detailNode.textContent}|${macroNode.textContent}`;
  }

  function scan() {
    document.querySelectorAll('.menu-list > article').forEach((article, index) => updateCard(article, index));
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    try {
      const url = typeof input === 'string' ? input : input?.url || '';
      const method = String(init?.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
      if (/\/rest\/v1\/food_entries(?:\?|$)/.test(url) && method === 'POST' && typeof init?.body === 'string') {
        const body = JSON.parse(init.body);
        const rows = Array.isArray(body) ? body : [body];
        let changed = false;
        for (const row of rows) {
          if (!row || !row.menu_key) continue;
          const actual = mealNutrition.get(row.menu_key) || mealNutrition.get(`title:${row.name}`);
          if (!actual) continue;
          row.calories = actual.calories;
          row.protein = actual.protein;
          changed = true;
        }
        if (changed) init = { ...init, body: JSON.stringify(Array.isArray(body) ? rows : rows[0]) };
      }
    } catch (_) {}
    return nativeFetch(input, init);
  };

  const observer = new MutationObserver(() => requestAnimationFrame(scan));
  const start = () => {
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    window.setInterval(scan, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();