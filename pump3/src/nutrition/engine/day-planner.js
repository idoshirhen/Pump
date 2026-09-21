import { mealsForSlot, materializeMealTemplate } from '../data/meal-catalog.js';
import { targetMealNutrition, validateDailyNutrition } from './meal-targeting.js';

const DEFAULT_SPLIT = Object.freeze({
  breakfast: { calories: 0.24, protein: 0.24 },
  lunch: { calories: 0.34, protein: 0.34 },
  dinner: { calories: 0.30, protein: 0.30 },
  snack: { calories: 0.12, protein: 0.12 },
});

function positive(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new TypeError(`${label} must be positive`);
  return n;
}

function scoreResult(result, target) {
  const caloriePenalty = Math.abs(result.meal.totals.calories - target.calories);
  const proteinShortfall = Math.max(0, target.protein - result.meal.totals.protein);
  return caloriePenalty + proteinShortfall * 12;
}

export function planDailyNutrition(target, {
  diet = 'omnivore',
  split = DEFAULT_SPLIT,
  seed = 0,
  calorieTolerancePerMeal = 35,
  proteinTolerancePerMeal = 4,
} = {}) {
  const calories = positive(target?.calories, 'target.calories');
  const protein = positive(target?.protein, 'target.protein');
  const slots = ['breakfast', 'lunch', 'dinner', 'snack'];
  const plannedMeals = [];

  for (const [slotIndex, slot] of slots.entries()) {
    const candidates = mealsForSlot(slot, { diet });
    if (!candidates.length) throw new Error(`No retained ${diet} meals for ${slot}`);

    const mealTarget = {
      calories: calories * split[slot].calories,
      protein: protein * split[slot].protein,
    };

    const ordered = candidates.map((candidate, index) => ({
      candidate,
      order: (index - (seed + slotIndex)) % candidates.length,
    })).sort((a, b) => a.order - b.order).map(({ candidate }) => candidate);

    let best = null;
    for (const template of ordered) {
      const materialized = materializeMealTemplate(template);
      const result = targetMealNutrition(materialized.items, mealTarget, {
        calorieTolerance: calorieTolerancePerMeal,
        proteinTolerance: proteinTolerancePerMeal,
      });
      const scored = { slot, template, target: mealTarget, ...result, score: scoreResult(result, mealTarget) };
      if (!best || scored.score < best.score) best = scored;
      if (result.withinTolerance) break;
    }
    plannedMeals.push(best);
  }

  const validation = validateDailyNutrition(
    plannedMeals.map((entry) => entry.meal),
    { calories, protein },
    { calorieTolerance: 120, proteinTolerance: 10 },
  );

  return {
    target: { calories, protein },
    diet,
    meals: plannedMeals,
    validation,
    withinTolerance: validation.caloriesOk && validation.proteinOk,
  };
}

export { DEFAULT_SPLIT };
