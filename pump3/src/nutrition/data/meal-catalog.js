import { CANONICAL_FOOD_BY_ID } from './canonical-foods.js';
import { calculateMeal } from '../engine/nutrition-engine.js';

function item(foodId, grams, options = {}) {
  return Object.freeze({ foodId, grams, ...options });
}

function meal(id, slot, title, tags, items) {
  return Object.freeze({ id, slot, title, tags: Object.freeze([...tags]), items: Object.freeze(items) });
}

// PUMP 3 runtime catalog. Every ingredient references a verified canonical food
// and every quantity is grams. There are deliberately no calorie/macro fields in
// these templates: totals must always be computed from ingredient quantities.
export const RETAINED_MEALS = Object.freeze([
  // Breakfast
  meal('breakfast-egg-cottage-potato', 'breakfast', 'ביצים, קוטג׳, תפוח אדמה וסלט', ['vegetarian', 'eggs', 'dairy'], [
    item('whole-egg', 100, { proteinScalable: true, minGrams: 50, maxGrams: 180 }),
    item('cottage-5', 120, { proteinScalable: true, minGrams: 80, maxGrams: 220 }),
    item('potato-baked', 180, { minGrams: 100, maxGrams: 350 }),
    item('israeli-salad-no-oil', 180, { scalable: false }),
  ]),
  meal('breakfast-oats-yogurt-apple', 'breakfast', 'יוגורט, שיבולת שועל, תפוח וחמאת בוטנים', ['vegetarian', 'dairy', 'oats'], [
    item('protein-yogurt-2-9', 200, { proteinScalable: true, minGrams: 150, maxGrams: 350 }),
    item('oats-raw', 45, { minGrams: 25, maxGrams: 100 }),
    item('apple-raw', 150, { scalable: false }),
    item('peanut-butter', 15, { minGrams: 5, maxGrams: 35 }),
  ]),
  meal('breakfast-tuna-potato-salad', 'breakfast', 'טונה, תפוח אדמה וסלט', ['fish', 'tuna', 'quick'], [
    item('tuna-canned-water', 130, { proteinScalable: true, minGrams: 90, maxGrams: 220 }),
    item('potato-baked', 220, { minGrams: 120, maxGrams: 400 }),
    item('israeli-salad-no-oil', 180, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 20 }),
  ]),
  meal('breakfast-tofu-sweet-potato', 'breakfast', 'טופו, בטטה וסלט', ['vegan', 'plant', 'tofu'], [
    item('tofu-firm', 160, { proteinScalable: true, minGrams: 110, maxGrams: 280 }),
    item('sweet-potato-baked', 220, { minGrams: 120, maxGrams: 400 }),
    item('israeli-salad-no-oil', 180, { scalable: false }),
    item('tahini-prepared', 20, { minGrams: 10, maxGrams: 45 }),
  ]),
  meal('breakfast-eggs-quinoa-salad', 'breakfast', 'ביצים, קינואה וסלט', ['vegetarian', 'eggs'], [
    item('whole-egg', 100, { proteinScalable: true, minGrams: 50, maxGrams: 180 }),
    item('quinoa-cooked', 170, { minGrams: 100, maxGrams: 320 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('tahini-prepared', 18, { minGrams: 8, maxGrams: 40 }),
  ]),
  meal('breakfast-cottage-bulgur-salad', 'breakfast', 'קוטג׳, בורגול וסלט', ['vegetarian', 'dairy'], [
    item('cottage-5', 180, { proteinScalable: true, minGrams: 120, maxGrams: 300 }),
    item('bulgur-cooked', 180, { minGrams: 100, maxGrams: 340 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 18 }),
  ]),

  // Lunch
  meal('lunch-chicken-rice-salad', 'lunch', 'חזה עוף, אורז וסלט', ['meat', 'chicken', 'rice'], [
    item('chicken-breast-roasted', 170, { proteinScalable: true, minGrams: 110, maxGrams: 280 }),
    item('rice-cooked', 210, { minGrams: 120, maxGrams: 420 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('tahini-prepared', 20, { minGrams: 8, maxGrams: 45 }),
  ]),
  meal('lunch-salmon-potato-salad', 'lunch', 'סלמון, תפוח אדמה וסלט', ['fish', 'salmon'], [
    item('salmon-baked', 170, { proteinScalable: true, minGrams: 120, maxGrams: 260 }),
    item('potato-baked', 280, { minGrams: 160, maxGrams: 500 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 18 }),
  ]),
  meal('lunch-tuna-pasta-tomato', 'lunch', 'פסטה עם טונה ורוטב עגבניות', ['fish', 'tuna', 'pasta'], [
    item('tuna-canned-water', 150, { proteinScalable: true, minGrams: 100, maxGrams: 240 }),
    item('pasta-cooked', 230, { minGrams: 130, maxGrams: 430 }),
    item('tomato-sauce-no-oil', 140, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 18 }),
  ]),
  meal('lunch-tofu-rice-stirfry', 'lunch', 'טופו, אורז וירקות מוקפצים', ['vegan', 'plant', 'tofu', 'rice'], [
    item('tofu-firm', 200, { proteinScalable: true, minGrams: 140, maxGrams: 320 }),
    item('rice-cooked', 210, { minGrams: 120, maxGrams: 420 }),
    item('vegetables-stir-fried', 220, { scalable: false }),
  ]),
  meal('lunch-chickpea-quinoa-bowl', 'lunch', 'חומוס, קינואה וסלט', ['vegan', 'plant', 'legumes'], [
    item('chickpeas-cooked', 220, { proteinScalable: true, minGrams: 150, maxGrams: 360 }),
    item('quinoa-cooked', 180, { minGrams: 100, maxGrams: 340 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('tahini-prepared', 20, { minGrams: 8, maxGrams: 45 }),
  ]),
  meal('lunch-lentil-bulgur-bowl', 'lunch', 'עדשים, בורגול וסלט', ['vegan', 'plant', 'legumes'], [
    item('lentils-cooked', 240, { proteinScalable: true, minGrams: 160, maxGrams: 380 }),
    item('bulgur-cooked', 220, { minGrams: 120, maxGrams: 420 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
    item('olive-oil', 10, { minGrams: 4, maxGrams: 22 }),
  ]),

  // Dinner
  meal('dinner-chicken-ptitim-salad', 'dinner', 'חזה עוף, פתיתים וסלט', ['meat', 'chicken'], [
    item('chicken-breast-roasted', 160, { proteinScalable: true, minGrams: 100, maxGrams: 260 }),
    item('ptitim-cooked-tomato', 220, { minGrams: 120, maxGrams: 420 }),
    item('israeli-salad-no-oil', 200, { scalable: false }),
  ]),
  meal('dinner-salmon-pasta-tomato', 'dinner', 'סלמון, פסטה ורוטב עגבניות', ['fish', 'salmon', 'pasta'], [
    item('salmon-baked', 150, { proteinScalable: true, minGrams: 100, maxGrams: 240 }),
    item('pasta-cooked', 210, { minGrams: 120, maxGrams: 400 }),
    item('tomato-sauce-no-oil', 140, { scalable: false }),
  ]),
  meal('dinner-tuna-quinoa-salad', 'dinner', 'טונה, קינואה וסלט', ['fish', 'tuna'], [
    item('tuna-canned-water', 140, { proteinScalable: true, minGrams: 90, maxGrams: 230 }),
    item('quinoa-cooked', 200, { minGrams: 110, maxGrams: 380 }),
    item('israeli-salad-no-oil', 220, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 18 }),
  ]),
  meal('dinner-tofu-potato-salad', 'dinner', 'טופו, תפוח אדמה וסלט', ['vegan', 'plant', 'tofu'], [
    item('tofu-firm', 190, { proteinScalable: true, minGrams: 130, maxGrams: 310 }),
    item('potato-baked', 260, { minGrams: 150, maxGrams: 470 }),
    item('israeli-salad-no-oil', 220, { scalable: false }),
    item('tahini-prepared', 18, { minGrams: 8, maxGrams: 40 }),
  ]),
  meal('dinner-lentil-rice-bowl', 'dinner', 'עדשים, אורז וסלט', ['vegan', 'plant', 'legumes'], [
    item('lentils-cooked', 230, { proteinScalable: true, minGrams: 150, maxGrams: 360 }),
    item('rice-cooked', 190, { minGrams: 110, maxGrams: 380 }),
    item('israeli-salad-no-oil', 220, { scalable: false }),
    item('olive-oil', 8, { minGrams: 3, maxGrams: 18 }),
  ]),
  meal('dinner-eggs-cottage-potato', 'dinner', 'ביצים, קוטג׳, תפוח אדמה וסלט', ['vegetarian', 'eggs', 'dairy'], [
    item('whole-egg', 100, { proteinScalable: true, minGrams: 50, maxGrams: 180 }),
    item('cottage-5', 160, { proteinScalable: true, minGrams: 100, maxGrams: 280 }),
    item('potato-baked', 230, { minGrams: 130, maxGrams: 430 }),
    item('israeli-salad-no-oil', 220, { scalable: false }),
  ]),

  // Snacks
  meal('snack-apple-peanut-butter', 'snack', 'תפוח וחמאת בוטנים', ['vegan', 'fruit', 'nuts'], [
    item('apple-raw', 170, { scalable: false }),
    item('peanut-butter', 18, { proteinScalable: true, minGrams: 8, maxGrams: 35 }),
  ]),
  meal('snack-protein-yogurt-dates', 'snack', 'יוגורט חלבון ותמרים', ['vegetarian', 'dairy'], [
    item('protein-yogurt-2-9', 200, { proteinScalable: true, minGrams: 150, maxGrams: 320 }),
    item('dates-dried-pitted', 35, { minGrams: 15, maxGrams: 70 }),
  ]),
  meal('snack-cottage-salad', 'snack', 'קוטג׳ וסלט', ['vegetarian', 'dairy'], [
    item('cottage-5', 160, { proteinScalable: true, minGrams: 100, maxGrams: 260 }),
    item('israeli-salad-no-oil', 180, { scalable: false }),
    item('olive-oil', 5, { minGrams: 2, maxGrams: 12 }),
  ]),
  meal('snack-tuna-potato', 'snack', 'טונה ותפוח אדמה', ['fish', 'tuna'], [
    item('tuna-canned-water', 90, { proteinScalable: true, minGrams: 60, maxGrams: 150 }),
    item('potato-baked', 120, { minGrams: 70, maxGrams: 220 }),
  ]),
  meal('snack-tofu-salad-tahini', 'snack', 'טופו, סלט וטחינה', ['vegan', 'plant', 'tofu'], [
    item('tofu-firm', 120, { proteinScalable: true, minGrams: 80, maxGrams: 200 }),
    item('israeli-salad-no-oil', 180, { scalable: false }),
    item('tahini-prepared', 15, { minGrams: 6, maxGrams: 30 }),
  ]),
  meal('snack-hard-boiled-eggs-potato', 'snack', 'ביצה קשה ותפוח אדמה', ['vegetarian', 'eggs'], [
    item('hard-boiled-egg', 100, { proteinScalable: true, minGrams: 50, maxGrams: 150 }),
    item('potato-baked', 120, { minGrams: 70, maxGrams: 220 }),
  ]),
]);

export const RETAINED_MEAL_BY_ID = Object.freeze(Object.fromEntries(
  RETAINED_MEALS.map((entry) => [entry.id, entry]),
));

export function materializeMealTemplate(template) {
  const resolvedItems = template.items.map(({ foodId, ...rest }) => {
    const food = CANONICAL_FOOD_BY_ID[foodId];
    if (!food) throw new Error(`Unknown canonical food ${foodId} in meal ${template.id}`);
    return { food, ...rest };
  });
  return { template, items: resolvedItems, meal: calculateMeal(resolvedItems) };
}

export function mealsForSlot(slot, { diet = 'omnivore' } = {}) {
  return RETAINED_MEALS.filter((entry) => {
    if (entry.slot !== slot) return false;
    if (diet === 'vegan') return entry.tags.includes('vegan');
    if (diet === 'vegetarian') return !entry.tags.includes('meat') && !entry.tags.includes('fish') && !entry.tags.includes('vegan');
    return true;
  });
}
