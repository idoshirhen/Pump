/* PUMP nutrition accuracy layer v2
   Single source of truth: displayed portions -> calculated calories/protein.
   Daily targets still come from the personalized PUMP plan; this layer only
   makes each meal mathematically consistent with the quantities shown.
*/
(() => {
  'use strict';

  const mealNutrition = new Map();
  const unknownSeen = new Set();

  const FOOD = [
    [/שמן זית|שמן שומשום/i, 8.84, 0],
    [/טחינה/i, 5.95, 0.17],
    [/חמאת בוטנים/i, 5.88, 0.25],
    [/אגוז/i, 6.20, 0.15],
    [/שקדים/i, 5.79, 0.21],
    [/חזה עוף|עוף מבושל|עוף מתובל/i, 1.65, 0.31],
    [/פרגי/i, 2.09, 0.26],
    [/קציצות הודו/i, 1.90, 0.24],
    [/הודו/i, 1.70, 0.29],
    [/קציצות בקר/i, 2.15, 0.24],
    [/בקר/i, 2.10, 0.26],
    [/סלמון/i, 2.08, 0.20],
    [/דג לבן|דג בתנור/i, 1.25, 0.26],
    [/טונה.*מים/i, 1.16, 0.26],
    [/טונה/i, 1.30, 0.26],
    [/תחליף עוף.*סויה/i, 1.70, 0.18],
    [/טופו/i, 1.44, 0.17],
    [/אדממה/i, 1.21, 0.12],
    [/קוטג.*5/i, 1.00, 0.11],
    [/קוטג/i, 0.98, 0.11],
    [/גבינה צהובה.*9/i, 2.50, 0.27],
    [/גבינה בולגרית.*5|גבינה מלוחה.*5/i, 1.25, 0.14],
    [/גבינה לבנה.*5|גבינה.*5/i, 1.05, 0.11],
    [/יוגורט.*חלבון|יוגורט PRO|סקיר/i, 0.70, 0.10],
    [/יוגורט טבעי/i, 0.65, 0.05],
    [/יוגורט סויה/i, 0.65, 0.04],
    [/משקה סויה/i, 0.43, 0.033],
    [/אורז.*מבושל|אורז מוכן/i, 1.30, 0.027],
    [/פתיתים.*מבושלים/i, 1.55, 0.052],
    [/פסטת עדשים/i, 1.45, 0.09],
    [/פסטה.*מבושלת/i, 1.57, 0.058],
    [/מג.?דרה/i, 1.45, 0.06],
    [/קציצות עדשים/i, 1.65, 0.09],
    [/עדשים.*מבושל/i, 1.16, 0.09],
    [/גרגירי חומוס קלויים/i, 3.64, 0.19],
    [/חומוס/i, 1.64, 0.089],
    [/מרק שעועית/i, 0.65, 0.04],
    [/שעועית/i, 1.27, 0.087],
    [/פול מבושל/i, 1.10, 0.076],
    [/קינואה.*מבושלת/i, 1.20, 0.044],
    [/בורגול.*מבושל/i, 0.83, 0.031],
    [/קוסקוס.*מבושל/i, 1.12, 0.038],
    [/תירס/i, 0.96, 0.034],
    [/פלאפל אפוי/i, 2.30, 0.13],
    [/תפוחי? אדמה.*אפוי|תפוחי? אדמה/i, 0.93, 0.025],
    [/בטטה/i, 0.90, 0.020],
    [/שיבולת שועל/i, 3.79, 0.13],
    [/מוזלי/i, 3.70, 0.10],
    [/רוטב שקשוקה|רוטב עגבניות/i, 0.45, 0.015],
    [/שמרי בירה/i, 3.50, 0.50],
    [/זיתים/i, 1.45, 0.01],
    [/ענבים|פרי/i, 0.60, 0.006],
  ];

  const UNIT = [
    [/ביצים? קשות?|ביצים?/i, 72, 6.3, 'whole'],
    [/לחם מלא/i, 78, 3.6, 'whole'],
    [/פיתה מלאה קטנה/i, 170, 6.0, 'half'],
    [/פיתה מלאה/i, 240, 8.5, 'half'],
    [/לחמנייה מלאה/i, 210, 8.0, 'whole'],
    [/טורטייה מחיטה מלאה/i, 180, 6.0, 'half'],
    [/קרקרים מלאים/i, 32, 0.8, 'whole'],
    [/פריכיות אורז/i, 35, 0.7, 'whole'],
    [/מעדן חלבון/i, 150, 20, 'whole'],
    [/תפוח$/i, 95, 0.5, 'whole'],
    [/תמרים/i, 23, 0.2, 'whole'],
    [/בננה/i, 105, 1.3, 'whole'],
    [/פרי טרי/i, 80, 1.0, 'whole'],
  ];

  const normalize = (s) => String(s || '').replace(/[״׳]/g, '').replace(/\s+/g, ' ').trim();

  function fixedProduce(name) {
    const n = normalize(name);
    if (/סלט גדול/i.test(n)) return { calories: 50, protein: 2.0 };
    if (/סלט|ירקות|עגבנייה|מלפפון/i.test(n)) return { calories: 35, protein: 1.5 };
    if (/לימון|זעתר|קינמון/i.test(n)) return { calories: 0, protein: 0 };
    return null;
  }

  function unitRow(name) {
    const n = normalize(name);
    return UNIT.find(([re]) => re.test(n));
  }

  function nutritionFor(name, amount, unit) {
    const n = normalize(name);
    const fixed = fixedProduce(n);
    if (fixed && /קערה|מנה|קורט/.test(unit)) return { ...fixed, known: true, fixed: true };

    if (/יח|פרוס/.test(unit)) {
      const row = unitRow(n);
      if (row) return { calories: row[1] * amount, protein: row[2] * amount, known: true };
    }
    if (/כפית/.test(unit)) return nutritionFor(n, amount * 5, 'גרם');
    if (/כף/.test(unit)) return nutritionFor(n, amount * 15, 'גרם');
    if (/גרם/.test(unit)) {
      const row = FOOD.find(([re]) => re.test(n));
      if (row) return { calories: row[1] * amount, protein: row[2] * amount, known: true };
    }
    if (fixed) return { ...fixed, known: true, fixed: true };

    const key = `${n}|${unit}`;
    if (!unknownSeen.has(key)) {
      unknownSeen.add(key);
      console.warn('[PUMP nutrition audit] unknown ingredient:', n, unit);
    }
    return { calories: 0, protein: 0, known: false };
  }

  function parseIngredient(text) {
    const clean = normalize(text).replace(/^ו/, '');
    if (/^כפית\s+/.test(clean)) return { amount: 1, unit: 'כפית', name: clean.replace(/^כפית\s+/, ''), raw: text };
    const m = clean.match(/^([\d.]+)\s*(גרם|יח׳?|פרוסות?|כף|כפית|קערה|מנה|קורט)\s+(.+)$/);
    if (!m) return null;
    return { amount: Number(m[1]), unit: m[2], name: m[3], raw: text };
  }

  function splitDetail(detail) {
    const text = normalize(detail);
    const match = text.match(/(?:כמות מוצעת|כמות מדויקת):\s*(.*?)(?:\s*·\s*להשלמת החלבון:|\s*·\s*להשלמת (?:יעד )?האנרגיה:|$)/);
    if (!match) return null;
    const ingredients = match[1].split(/\s*·\s*/).map(parseIngredient).filter(Boolean);
    const proteinMatch = text.match(/להשלמת החלבון:\s*([^·]+)/);
    const energyMatch = text.match(/להשלמת (?:יעד )?האנרגיה:\s*(.+)$/);
    const extras = [];
    if (proteinMatch) {
      const x = parseIngredient(proteinMatch[1]);
      if (x) extras.push({ ...x, role: 'protein-extra' });
    }
    if (energyMatch) {
      energyMatch[1].split(/\s*·\s*/).forEach((part) => {
        const x = parseIngredient(part);
        if (x) extras.push({ ...x, role: 'energy-extra' });
      });
    }
    return { ingredients, extras };
  }

  function calc(items) {
    return items.reduce((sum, item) => {
      const n = nutritionFor(item.name, item.amount, item.unit);
      return { calories: sum.calories + n.calories, protein: sum.protein + n.protein, known: sum.known && n.known };
    }, { calories: 0, protein: 0, known: true });
  }

  function amountFloor(item) {
    if (!/גרם/.test(item.unit)) return 0.5;
    if (/שמן|טחינה|חמאת בוטנים/i.test(item.name)) return 5;
    if (/עוף|פרג|הודו|בקר|טונה|סלמון|דג|טופו|גבינה|קוטג|יוגורט|עדשים|חומוס|שעועית|פול|אדממה/i.test(item.name)) return 50;
    return 30;
  }

  function roundPractical(item, value) {
    value = Math.max(amountFloor(item), value);
    if (/גרם/.test(item.unit)) {
      const step = /שמן|טחינה|חמאת בוטנים/i.test(item.name) ? 5 : value >= 100 ? 10 : 5;
      return Math.max(step, Math.round(value / step) * step);
    }
    const row = unitRow(item.name);
    const mode = row?.[3] || 'half';
    if (mode === 'whole' || /פרוס/.test(item.unit)) return Math.max(1, Math.round(value));
    return Math.max(0.5, Math.round(value * 2) / 2);
  }

  function isProtein(item) {
    return /עוף|פרג|הודו|בקר|טונה|סלמון|דג|טופו|אדממה|קוטג|גבינה|יוגורט|ביצה|עדשים|חומוס|שעועית|פול/i.test(item.name);
  }
  function isCarb(item) {
    return /אורז|פתיתים|פסטה|קוסקוס|בורגול|קינואה|תפוח|בטטה|לחם|פיתה|לחמנייה|טורטייה|שיבולת|מוזלי|פריכיות|קרקרים/i.test(item.name);
  }
  function isFineEnergy(item) {
    return /טחינה|שמן|אגוז|חמאת בוטנים/i.test(item.name);
  }

  function tunePortions(parsed, targetCalories, targetProtein) {
    const items = [...parsed.ingredients.map(x => ({ ...x })), ...parsed.extras.map(x => ({ ...x }))];
    let totals = calc(items);
    if (!totals.known || !items.length) return { items, totals, tuned: false };

    const proteinItem = items.find(x => isProtein(x) && nutritionFor(x.name, 1, x.unit).protein > 0);
    if (proteinItem && targetProtein > 0 && totals.protein < targetProtein - 3) {
      const per = nutritionFor(proteinItem.name, 1, proteinItem.unit);
      proteinItem.amount = roundPractical(proteinItem, proteinItem.amount + (targetProtein - totals.protein) / per.protein);
      totals = calc(items);
    }

    let delta = targetCalories - totals.calories;
    const carb = items.find(isCarb);
    if (carb && Math.abs(delta) > 20) {
      const per = nutritionFor(carb.name, 1, carb.unit);
      if (per.calories > 0) {
        carb.amount = roundPractical(carb, carb.amount + delta / per.calories);
        totals = calc(items);
      }
    }

    delta = targetCalories - totals.calories;
    const fine = items.find(isFineEnergy);
    if (fine && Math.abs(delta) > 10) {
      const per = nutritionFor(fine.name, 1, fine.unit);
      if (per.calories > 0) {
        fine.amount = roundPractical(fine, fine.amount + delta / per.calories);
        totals = calc(items);
      }
    }

    return { items, totals, tuned: true };
  }

  function formatIngredient(item) {
    const amount = Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1).replace(/\.0$/, '');
    return `${amount} ${item.unit} ${item.name}`;
  }

  function currentSignature(article) {
    return [article.querySelector('h3')?.textContent, article.querySelector('h3 + p')?.textContent, article.querySelector('h3 + p + small')?.textContent].join('|');
  }

  function updateCard(article, index) {
    if (!article) return;
    const signature = currentSignature(article);
    if (article.dataset.pumpNutritionSignature === signature) return;

    const title = article.querySelector('h3')?.textContent?.trim();
    const detailNode = article.querySelector('h3 + p');
    const macroNode = article.querySelector('h3 + p + small');
    if (!title || !detailNode || !macroNode) return;

    const targetCaloriesMatch = macroNode.textContent.match(/([\d,]+)\s*קל/);
    const targetProteinMatch = macroNode.textContent.match(/([\d.]+)\s*גרם\s*חלבון/);
    if (!targetCaloriesMatch) return;
    const targetCalories = Number(targetCaloriesMatch[1].replace(/,/g, ''));
    const targetProtein = targetProteinMatch ? Number(targetProteinMatch[1]) : 0;
    const parsed = splitDetail(detailNode.textContent);
    if (!parsed) return;

    const result = tunePortions(parsed, targetCalories, targetProtein);
    if (!result.totals.known) {
      article.dataset.pumpNutritionSignature = signature;
      return;
    }

    const calories = Math.round(result.totals.calories);
    const protein = Math.round(result.totals.protein);
    const main = result.items.filter(x => !x.role);
    const proteinExtra = result.items.filter(x => x.role === 'protein-extra');
    const energyExtra = result.items.filter(x => x.role === 'energy-extra');

    let detail = `כמות מדויקת: ${main.map(formatIngredient).join(' · ')}`;
    if (proteinExtra.length) detail += ` · להשלמת החלבון: ${proteinExtra.map(formatIngredient).join(' · ')}`;
    if (energyExtra.length) detail += ` · להשלמת האנרגיה: ${energyExtra.map(formatIngredient).join(' · ')}`;
    detailNode.textContent = detail;
    macroNode.textContent = `כ־${protein} גרם חלבון · ${calories.toLocaleString('he-IL')} קל׳`;

    const deviation = calories - targetCalories;
    macroNode.title = `מחושב מהכמויות שמופיעות בארוחה. יעד הארוחה: ${targetCalories.toLocaleString('he-IL')} קל׳; סטייה: ${deviation >= 0 ? '+' : ''}${deviation} קל׳.`;

    const menuKey = `menu-${index}`;
    mealNutrition.set(menuKey, { title, calories, protein });
    mealNutrition.set(`title:${title}`, { title, calories, protein });
    article.dataset.pumpCalculatedCalories = String(calories);
    article.dataset.pumpCalculatedProtein = String(protein);
    article.dataset.pumpNutritionSignature = currentSignature(article);
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
    } catch (error) {
      console.warn('[PUMP nutrition accuracy] food tracking sync skipped', error);
    }
    return nativeFetch(input, init);
  };

  const observer = new MutationObserver(() => scan());
  const start = () => {
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    window.setInterval(scan, 1200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
