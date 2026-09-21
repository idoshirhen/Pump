import assert from 'node:assert/strict';
import { CANONICAL_FOOD_BY_ID } from '../src/nutrition/data/canonical-foods.js';
import { calculateMeal } from '../src/nutrition/engine/nutrition-engine.js';
import { scaleMealToCalorieTarget, targetMealNutrition, validateDailyNutrition } from '../src/nutrition/engine/meal-targeting.js';

const tuna = CANONICAL_FOOD_BY_ID['tuna-canned-water'];
const couscous = CANONICAL_FOOD_BY_ID['couscous-cooked'];
const oliveOil = CANONICAL_FOOD_BY_ID['olive-oil'];

const targeted = scaleMealToCalorieTarget([
  { food: tuna, grams: 120, scalable: true, minGrams: 80, maxGrams: 220 },
  { food: couscous, grams: 180, scalable: true, minGrams: 100, maxGrams: 320 },
  { food: oliveOil, grams: 10, scalable: false },
], 650, { toleranceCalories: 15 });

assert.equal(targeted.withinTolerance, true, `expected meal to hit calorie target, got ${targeted.meal.totals.calories}`);
assert.ok(Math.abs(targeted.meal.totals.calories - 650) <= 15);
assert.equal(targeted.items.find((item) => item.food.id === 'olive-oil').grams, 10, 'fixed ingredient must not be scaled');

const dualTargetInput = [
  { food: tuna, grams: 120, scalable: true, proteinScalable: true, minGrams: 80, maxGrams: 300 },
  { food: couscous, grams: 180, scalable: true, minGrams: 80, maxGrams: 400 },
  { food: oliveOil, grams: 10, scalable: false },
];
const dualA = targetMealNutrition(dualTargetInput, { calories: 600, protein: 45 });
const dualB = targetMealNutrition(dualTargetInput, { calories: 600, protein: 45 });
assert.equal(dualA.withinTolerance, true, `dual target failed: ${JSON.stringify(dualA.meal.totals)}`);
assert.ok(dualA.meal.totals.protein >= 43);
assert.ok(Math.abs(dualA.meal.totals.calories - 600) <= 15);
assert.deepEqual(dualA.items.map((item) => item.grams), dualB.items.map((item) => item.grams), 'targeting must be deterministic');
assert.equal(dualA.items.find((item) => item.food.id === 'olive-oil').grams, 10, 'fixed ingredient changed during dual targeting');

assert.throws(() => targetMealNutrition([
  { food: couscous, grams: 180, scalable: true },
], { calories: 400, protein: 30 }), /proteinScalable/);

const mealA = calculateMeal([{ food: tuna, grams: 200 }, { food: couscous, grams: 250 }]);
const mealB = calculateMeal([{ food: CANONICAL_FOOD_BY_ID['whole-egg'], grams: 150 }, { food: CANONICAL_FOOD_BY_ID['oats-raw'], grams: 80 }]);
const daily = validateDailyNutrition([mealA, mealB], { calories: mealA.totals.calories + mealB.totals.calories, protein: mealA.totals.protein + mealB.totals.protein });
assert.equal(daily.caloriesOk, true);
assert.equal(daily.proteinOk, true);

console.log('PUMP 3 meal targeting checks passed');
