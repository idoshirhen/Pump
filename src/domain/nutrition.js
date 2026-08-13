const round10 = (value) => Math.round(value / 10) * 10;

const MAIN_OPTIONS = {
  regular: [
    ['עוף, אורז וירקות', 'חזה עוף, אורז וירקות בתיבול שאוהבים.'],
    ['פסטה עם טונה', 'פסטה, טונה, ירקות ושמן זית.'],
    ['קציצות עם תפוחי אדמה', 'קציצות, תפוחי אדמה וסלט גדול.']
  ],
  vegetarian: [
    ['פסטה עם עדשים', 'פסטה, עדשים, רוטב עגבניות וירקות.'],
    ['חביתה, לחם וירקות', 'ביצים, לחם מלא, גבינה וירקות.'],
    ['קערת קינואה וטופו', 'קינואה, טופו, ירקות וטחינה.']
  ],
  vegan: [
    ['קערת אורז וטופו', 'אורז, טופו, ירקות וטחינה.'],
    ['פסטה עם עדשים', 'פסטה, עדשים ורוטב עגבניות.'],
    ['כריך חומוס וטופו', 'לחם מלא, חומוס, טופו וירקות.']
  ]
};

const SNACK_OPTIONS = {
  regular: [
    ['פרי וסקיר / יוגורט PRO', 'פרי אחד עם סקיר או יוגורט חלבון.', 170, 18],
    ['כריך קטן עם חלבון', 'לחם מלא עם קוטג׳, טונה או ביצה.', 250, 20],
    ['אגוזים ופרי', 'חופן קטן של אגוזים עם פרי.', 180, 8]
  ],
  vegetarian: [
    ['פרי וסקיר / יוגורט PRO', 'פרי אחד עם סקיר או יוגורט חלבון.', 170, 18],
    ['כריך קטן עם גבינה', 'לחם מלא עם קוטג׳ או ביצה.', 250, 20],
    ['אגוזים ופרי', 'חופן קטן של אגוזים עם פרי.', 180, 8]
  ],
  vegan: [
    ['פרי ויוגורט סויה', 'פרי אחד עם יוגורט סויה עשיר בחלבון.', 170, 12],
    ['כריך חומוס וטופו', 'לחם מלא עם חומוס, טופו וירקות.', 250, 17],
    ['אגוזים ופרי', 'חופן קטן של אגוזים עם פרי.', 180, 8]
  ]
};

const foodStyle = (diet = '') => /טבעונ/i.test(diet) ? 'vegan' : /צמחונ/i.test(diet) ? 'vegetarian' : 'regular';
const splitWhole = (total, count) => Array.from({ length: count }, (_, index) => index === count - 1 ? total - Math.floor(total / count) * (count - 1) : Math.floor(total / count));

export function resolveMealStructure({ mealPattern = 'three', snackCount } = {}) {
  const mainMeals = mealPattern === 'two' ? 2 : 3;
  const snacks = Number.isInteger(snackCount) ? snackCount : mealPattern === 'two' || mealPattern === 'flexible' ? 2 : 1;
  if (snacks < 0 || snacks > 2) throw new Error('מספר ארוחות הביניים חייב להיות בין 0 ל־2.');
  return { mainMeals, snacks };
}

export function buildNutritionPlan({ calories, protein, diet, mealPattern, snackCount }) {
  if (!Number.isFinite(calories) || calories < 1200) throw new Error('יעד הקלוריות אינו תקין.');
  if (!Number.isFinite(protein) || protein < 0) throw new Error('יעד החלבון אינו תקין.');
  const { mainMeals, snacks } = resolveMealStructure({ mealPattern, snackCount });
  const style = foodStyle(diet);
  const snackOptions = SNACK_OPTIONS[style];
  const selectedSnackOptions = snackOptions.slice(0, snacks);
  const snackCalories = selectedSnackOptions.reduce((sum, option) => sum + option[2], 0);
  const snackProtein = selectedSnackOptions.reduce((sum, option) => sum + option[3], 0);
  if (calories - snackCalories < mainMeals * 300) throw new Error('יעד הקלוריות נמוך מדי לחלוקה הזו.');
  const mainCalories = splitWhole(calories - snackCalories, mainMeals).map(round10);
  mainCalories[mainCalories.length - 1] += calories - snackCalories - mainCalories.reduce((sum, value) => sum + value, 0);
  const mainProtein = splitWhole(Math.max(0, protein - snackProtein), mainMeals);
  const timings = mainMeals === 2 ? ['צהריים', 'ערב'] : ['בוקר', 'צהריים', 'ערב'];
  const meals = timings.map((timing, index) => ({
    id: `main-${index}`,
    kind: 'main',
    timing,
    label: index === 0 && mainMeals === 2 ? 'הארוחה הראשונה של היום' : 'ארוחה עיקרית מותאמת',
    calories: mainCalories[index],
    protein: mainProtein[index],
    options: MAIN_OPTIONS[style].map(([title, detail]) => ({ title, detail }))
  }));
  selectedSnackOptions.forEach(([title, detail, snackCal, snackPro], index) => meals.push({
    id: `snack-${index}`,
    kind: 'snack',
    timing: `ארוחת ביניים ${index + 1}`,
    label: index === 0 ? 'שומרים על שובע בין הארוחות' : 'סוגרים את הפער עד לארוחה הבאה',
    calories: snackCal,
    protein: snackPro,
    options: snackOptions.map(([optionTitle, optionDetail]) => ({ title: optionTitle, detail: optionDetail }))
  }));
  return { meals, totals: { calories, protein } };
}
