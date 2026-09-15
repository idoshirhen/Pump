/* PUMP nutrition accuracy layer v1
   - Keeps the personalized daily calorie/protein targets from the app.
   - Recalculates meal macros from the quantities actually shown to the user.
   - Adjusts practical portions toward each meal's assigned target.
   - Ensures tracked food entries use the recalculated values instead of target placeholders.
*/
(() => {
  'use strict';

  const mealNutrition = new Map();
  const FOOD = [
    [/שמן זית/i, .884, 0],
    [/טחינה/i, 5.95, .17],
    [/חמאת בוטנים/i, 5.88, .25],
    [/אגוז/i, 6.20, .15],
    [/שקדים/i, 5.79, .21],
    [/חזה עוף|עוף מבושל|עוף מתובל/i, 1.65, .31],
    [/פרגי/i, 2.09, .26],
    [/הודו/i, 1.70, .29],
    [/קציצות בקר/i, 2.15, .24],
    [/קציצות הודו/i, 1.90, .24],
    [/בקר/i, 2.10, .26],
    [/סלמון/i, 2.08, .20],
    [/טונה.*מים/i, 1.16, .26],
    [/טונה/i, 1.30, .26],
    [/טופו/i, 1.44, .17],
    [/קוטג.*5/i, 1.00, .11],
    [/קוטג/i, .98, .11],
    [/גבינה.*5/i, 1.05, .11],
    [/בולגרית/i, 2.35, .14],
    [/יוגורט.*חלבון|יוגורט PRO|סקיר/i, .70, .10],
    [/יוגורט סויה/i, .65, .04],
    [/משקה סויה/i, .43, .033],
    [/אורז.*מבושל|אורז מוכן/i, 1.30, .027],
    [/פתיתים.*מבושלים/i, 1.55, .052],
    [/פסטה.*מבושלת/i, 1.57, .058],
    [/פסטת עדשים/i, 1.45, .09],
    [/מג.?דרה/i, 1.45, .06],
    [/עדשים.*מבושל/i, 1.16, .09],
    [/חומוס(?!.*טחינה)/i, 1.64, .089],
    [/שעועית/i, 1.27, .087],
    [/תפוחי? אדמה.*אפוי|תפוחי? אדמה/i, .93, .025],
    [/בטטה/i, .90, .02],
    [/שיבולת שועל/i, 3.79, .13],
    [/רוטב שקשוקה|רוטב עגבניות/i, .45, .015],
    [/אבקת חלבון.*צמח/i, 3.75, .75],
    [/אבקת חלבון/i, 3.85, .78],
  ];

  const UNIT = {
    'ביצה': { kcal: 72, protein: 6.3 },
    'ביצים': { kcal: 72, protein: 6.3 },
    'ביצה קשה': { kcal: 72, protein: 6.3 },
    'ביצים קשות': { kcal: 72, protein: 6.3 },
    'לחם מלא': { kcal: 78, protein: 3.6 },
    'פיתה מלאה': { kcal: 240, protein: 8.5 },
    'לחמנייה מלאה': { kcal: 210, protein: 8 },
    'פרי טרי': { kcal: 80, protein: 1 },
    'בננה': { kcal: 105, protein: 1.3 },
  };

  const IGNORE = /סלט|ירקות|עגבנייה|מלפפון|חמוצים|תבלינים/i;
  const normalize = (s) => String(s || '').replace(/[״׳]/g, '').replace(/\s+/g, ' ').trim();

  function nutritionFor(name, amount, unit) {
    const n = normalize(name);
    if (IGNORE.test(n)) return { calories: 35, protein: 1.5, known: true, fixed: true };
    if (/יח|פרוס/.test(unit)) {
      const key = Object.keys(UNIT).find((k) => n.includes(k));
      if (key) return { calories: UNIT[key].kcal * amount, protein: UNIT[key].protein * amount, known: true };
    }
    if (/כף/.test(unit)) return nutritionFor(n, amount * 15, 'גרם');
    if (/גרם/.test(unit)) {
      const row = FOOD.find(([re]) => re.test(n));
      if (row) return { calories: row[1] * amount, protein: row[2] * amount, known: true };
    }
    return { calories: 0, protein: 0, known: false };
  }

  function parseIngredient(text) {
    const clean = normalize(text).replace(/^ו/, '');
    const m = clean.match(/^([\d.]+)\s*(גרם|יח׳?|פרוסות?|כף|קערה)\s+(.+)$/);
    if (!m) return null;
    return { amount: Number(m[1]), unit: m[2], name: m[3], raw: text };
  }

  function splitDetail(detail) {
    const text = normalize(detail);
    const match = text.match(/כמות מוצעת:\s*(.*?)(?:\s*·\s*להשלמת החלבון:|\s*·\s*להשלמת יעד האנרגיה:|$)/);
    if (!match) return null;
    const ingredients = match[1].split(/\s*·\s*/).map(parseIngredient).filter(Boolean);
    const proteinMatch = text.match(/להשלמת החלבון:\s*([^·]+)/);
    const energyMatch = text.match(/להשלמת יעד האנרגיה:\s*(.+)$/);
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
      return {
        calories: sum.calories + n.calories,
        protein: sum.protein + n.protein,
        known: sum.known && n.known,
      };
    }, { calories: 0, protein: 0, known: true });
  }

  function roundPractical(item, value) {
    value = Math.max(0, value);
    if (/גרם/.test(item.unit)) {
      const step = /שמן זית|טחינה|חמאת בוטנים/i.test(item.name) ? 5 : value >= 100 ? 10 : 5;
      return Math.max(step, Math.round(value / step) * step);
    }
    if (/יח|פרוס|כף/.test(item.unit)) return Math.max(.5, Math.round(value * 2) / 2);
    return Math.max(1, Math.round(value));
  }

  function isProtein(item) {
    return /עוף|פרג|הודו|בקר|טונה|סלמון|טופו|קוטג|גבינה|יוגורט|סקיר|ביצה|חלבון/i.test(item.name);
  }
  function isEnergy(item) {
    return /אורז|פתיתים|פסטה|תפוח|בטטה|לחם|פיתה|לחמנייה|שיבולת|טחינה|שמן|אגוז|חמאת/i.test(item.name);
  }

  function tunePortions(parsed, targetCalories, targetProtein) {
    const items = [...parsed.ingredients.map(x => ({...x})), ...parsed.extras.map(x => ({...x}))];
    let totals = calc(items);
    if (!totals.known || !items.length) return { items, totals, tuned: false };

    const proteinItem = items.find(isProtein);
    if (proteinItem && targetProtein > 0 && totals.protein < targetProtein - 3) {
      const per = nutritionFor(proteinItem.name, 1, proteinItem.unit);
      if (per.protein > 0) {
        const need = targetProtein - totals.protein;
        proteinItem.amount = roundPractical(proteinItem, proteinItem.amount + need / per.protein);
        totals = calc(items);
      }
    }

    let delta = targetCalories - totals.calories;
    const energyItems = items.filter(isEnergy);
    const preferred = energyItems.find(x => /אורז|פתיתים|פסטה|תפוח|בטטה|לחם|פיתה|לחמנייה|שיבולת/i.test(x.name)) || energyItems[0];
    if (preferred && Math.abs(delta) > 15) {
      const per = nutritionFor(preferred.name, 1, preferred.unit);
      if (per.calories > 0) {
        preferred.amount = roundPractical(preferred, preferred.amount + delta / per.calories);
        totals = calc(items);
      }
    }

    delta = targetCalories - totals.calories;
    const fine = items.find(x => /טחינה|שמן זית|אגוז|חמאת בוטנים/i.test(x.name));
    if (fine && Math.abs(delta) > 12) {
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

  function updateCard(article, index) {
    if (!article || article.dataset.pumpNutritionAccuracy === '1') return;
    const title = article.querySelector('h3')?.textContent?.trim();
    const detailNode = article.querySelector('h3 + p');
    const macroNode = article.querySelector('h3 + p + small');
    if (!title || !detailNode || !macroNode) return;

    const targetCaloriesMatch = macroNode.textContent.match(/כ־?\s*([\d,]+)\s*קל/);
    const targetProteinMatch = macroNode.textContent.match(/כ־?\s*([\d.]+)\s*גרם\s*חלבון/);
    if (!targetCaloriesMatch) return;
    const targetCalories = Number(targetCaloriesMatch[1].replace(/,/g, ''));
    const targetProtein = targetProteinMatch ? Number(targetProteinMatch[1]) : 0;
    const parsed = splitDetail(detailNode.textContent);
    if (!parsed) return;

    const result = tunePortions(parsed, targetCalories, targetProtein);
    if (!result.totals.known) return;

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
    macroNode.title = `מחושב מהכמויות שמופיעות בארוחה. יעד הארוחה: ${targetCalories.toLocaleString('he-IL')} קל׳`;

    const menuKey = `menu-${index}`;
    mealNutrition.set(menuKey, { title, calories, protein });
    mealNutrition.set(`title:${title}`, { title, calories, protein });
    article.dataset.pumpNutritionAccuracy = '1';
    article.dataset.pumpCalculatedCalories = String(calories);
    article.dataset.pumpCalculatedProtein = String(protein);
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

  const observer = new MutationObserver(() => queueMicrotask(scan));
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', scan);
  setInterval(scan, 1200);
})();
