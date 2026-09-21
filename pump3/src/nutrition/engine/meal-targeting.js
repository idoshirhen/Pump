import { calculateMeal, roundNutrition } from './nutrition-engine.js';
import { assertPlanningReady } from '../data/food-registry.js';

function finitePositive(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new TypeError(`${label} must be a positive number`);
  return number;
}

function normalizeItems(items) {
  return items.map((item) => {
    assertPlanningReady(item.food);
    return {
      ...item,
      grams: finitePositive(item.grams, 'grams'),
      scalable: item.scalable !== false,
      proteinScalable: item.proteinScalable === true,
      minGrams: Number.isFinite(Number(item.minGrams)) ? Number(item.minGrams) : null,
      maxGrams: Number.isFinite(Number(item.maxGrams)) ? Number(item.maxGrams) : null,
    };
  });
}

function clampGrams(item, grams) {
  let next = grams;
  if (item.minGrams !== null) next = Math.max(next, item.minGrams);
  if (item.maxGrams !== null) next = Math.min(next, item.maxGrams);
  return Math.max(0.1, next);
}

export function scaleMealToCalorieTarget(items, targetCalories, {
  minScale = 0.6,
  maxScale = 1.8,
  toleranceCalories = 15,
  maxIterations = 30,
} = {}) {
  const target = finitePositive(targetCalories, 'targetCalories');
  const normalized = normalizeItems(items);

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
    const scaledItems = normalized.map((item) => item.scalable
      ? { ...item, grams: clampGrams(item, item.grams * scale) }
      : item);
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

// Deterministic two-target solver. A meal must explicitly mark at least one
// proteinScalable item (normally chicken/tuna/tofu/legumes). We first move that
// protein anchor toward the protein target, then use the remaining scalable
// items to close the calorie gap. Repeating this coordinate-descent loop avoids
// random search and guarantees the same input always produces the same portion.
export function targetMealNutrition(items, target, {
  calorieTolerance = 15,
  proteinTolerance = 2,
  maxIterations = 20,
} = {}) {
  const targetCalories = finitePositive(target?.calories, 'target.calories');
  const targetProtein = finitePositive(target?.protein, 'target.protein');
  let working = normalizeItems(items);
  const proteinIndexes = working.map((item, index) => item.proteinScalable ? index : -1).filter((index) => index >= 0);
  if (proteinIndexes.length === 0) throw new TypeError('at least one proteinScalable item is required');

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let meal = calculateMeal(working);
    const proteinError = targetProtein - meal.totals.protein;
    if (Math.abs(proteinError) > proteinTolerance) {
      const index = proteinIndexes[0];
      const item = working[index];
      const proteinPerGram = Number(item.food.per100g.protein) / 100;
      if (proteinPerGram > 0) {
        working = working.map((entry, i) => i === index
          ? { ...entry, grams: clampGrams(entry, entry.grams + proteinError / proteinPerGram) }
          : entry);
      }
    }

    meal = calculateMeal(working);
    const calorieError = targetCalories - meal.totals.calories;
    const calorieIndex = working.findIndex((item, index) => item.scalable && !proteinIndexes.includes(index));
    if (Math.abs(calorieError) > calorieTolerance && calorieIndex >= 0) {
      const item = working[calorieIndex];
      const caloriesPerGram = Number(item.food.per100g.calories) / 100;
      if (caloriesPerGram > 0) {
        working = working.map((entry, i) => i === calorieIndex
          ? { ...entry, grams: clampGrams(entry, entry.grams + calorieError / caloriesPerGram) }
          : entry);
      }
    }

    meal = calculateMeal(working);
    if (Math.abs(meal.totals.calories - targetCalories) <= calorieTolerance
      && meal.totals.protein >= targetProtein - proteinTolerance) break;
  }

  const meal = calculateMeal(working);
  const totals = roundNutrition(meal.totals, 1);
  return {
    items: working,
    meal: { ...meal, totals },
    calorieError: Math.round((totals.calories - targetCalories) * 10) / 10,
    proteinError: Math.round((totals.protein - targetProtein) * 10) / 10,
    caloriesOk: Math.abs(totals.calories - targetCalories) <= calorieTolerance,
    proteinOk: totals.protein >= targetProtein - proteinTolerance,
    withinTolerance: Math.abs(totals.calories - targetCalories) <= calorieTolerance
      && totals.protein >= targetProtein - proteinTolerance,
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
