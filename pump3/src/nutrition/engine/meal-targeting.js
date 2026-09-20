import { calculateMeal, roundNutrition } from './nutrition-engine.js';
import { assertPlanningReady } from '../data/food-registry.js';

function finitePositive(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new TypeError(`${label} must be a positive number`);
  return number;
}

export function scaleMealToCalorieTarget(items, targetCalories, {
  minScale = 0.6,
  maxScale = 1.8,
  toleranceCalories = 15,
  maxIterations = 30,
} = {}) {
  const target = finitePositive(targetCalories, 'targetCalories');
  const normalized = items.map((item) => {
    assertPlanningReady(item.food);
    return {
      ...item,
      grams: finitePositive(item.grams, 'grams'),
      scalable: item.scalable !== false,
      minGrams: Number.isFinite(Number(item.minGrams)) ? Number(item.minGrams) : null,
      maxGrams: Number.isFinite(Number(item.maxGrams)) ? Number(item.maxGrams) : null,
    };
  });

  if (!normalized.some((item) => item.scalable)) {
    const meal = calculateMeal(normalized);
    return { items: normalized, meal, withinTolerance: Math.abs(meal.totals.calories - target) <= toleranceCalories };
  }

  const baseMeal = calculateMeal(normalized);
  if (baseMeal.totals.calories <= 0) throw new TypeError('meal calories must be positive');

  let low = minScale;
  let high = maxScale;
  let best = null;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const scale = (low + high) / 2;
    const scaledItems = normalized.map((item) => {
      if (!item.scalable) return item;
      let grams = item.grams * scale;
      if (item.minGrams !== null) grams = Math.max(grams, item.minGrams);
      if (item.maxGrams !== null) grams = Math.min(grams, item.maxGrams);
      return { ...item, grams };
    });
    const meal = calculateMeal(scaledItems);
    const error = meal.totals.calories - target;
    const candidate = { items: scaledItems, meal, error, scale };
    if (!best || Math.abs(error) < Math.abs(best.error)) best = candidate;
    if (Math.abs(error) <= toleranceCalories) break;
    if (error < 0) low = scale;
    else high = scale;
  }

  return {
    items: best.items,
    meal: { ...best.meal, totals: roundNutrition(best.meal.totals, 1) },
    scale: best.scale,
    calorieError: Math.round(best.error * 10) / 10,
    withinTolerance: Math.abs(best.error) <= toleranceCalories,
  };
}

export function validateDailyNutrition(meals, target, {
  calorieTolerance = 50,
  proteinTolerance = 5,
} = {}) {
  if (!Array.isArray(meals) || meals.length === 0) throw new TypeError('meals are required');
  const totals = meals.reduce((sum, meal) => {
    for (const key of ['calories', 'protein', 'carbs', 'fat']) sum[key] += Number(meal.totals?.[key] ?? 0);
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const rounded = roundNutrition(totals, 1);
  return {
    totals: rounded,
    calorieDelta: rounded.calories - Number(target.calories ?? 0),
    proteinDelta: rounded.protein - Number(target.protein ?? 0),
    caloriesOk: Math.abs(rounded.calories - Number(target.calories ?? 0)) <= calorieTolerance,
    proteinOk: rounded.protein >= Number(target.protein ?? 0) - proteinTolerance,
  };
}
