import assert from 'node:assert/strict';
import {
  createFoodRecord,
  calculateFood,
  calculateMeal,
  roundNutrition,
  compareToTarget,
  validateFoodRecord,
} from '../src/nutrition/engine/nutrition-engine.js';

const rice = createFoodRecord({
  id: 'rice-cooked-test',
  name: 'Test cooked rice',
  state: 'cooked',
  per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  source: { provider: 'test-fixture', status: 'verified-test' },
});

const chicken = createFoodRecord({
  id: 'chicken-cooked-test',
  name: 'Test cooked chicken breast',
  state: 'cooked',
  per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  source: { provider: 'test-fixture', status: 'verified-test' },
});

assert.deepEqual(roundNutrition(calculateFood(rice, 200), 1), {
  calories: 260,
  protein: 5.4,
  carbs: 56.4,
  fat: 0.6,
});

const meal = calculateMeal([
  { food: rice, grams: 200 },
  { food: chicken, grams: 150 },
]);

assert.deepEqual(roundNutrition(meal.totals, 1), {
  calories: 507.5,
  protein: 51.9,
  carbs: 56.4,
  fat: 6,
});

assert.deepEqual(roundNutrition(compareToTarget(meal.totals, {
  calories: 550,
  protein: 50,
  carbs: 60,
  fat: 15,
}), 1), {
  calories: -42.5,
  protein: 1.9,
  carbs: -3.6,
  fat: -9,
});

assert.deepEqual(validateFoodRecord(rice), { valid: true, problems: [] });

const unknownState = createFoodRecord({
  id: 'unknown-state-test',
  name: 'Unknown state food',
  per100g: { calories: 100, protein: 5, carbs: 10, fat: 2 },
  source: { provider: 'test-fixture', status: 'provisional' },
});
assert.equal(validateFoodRecord(unknownState).valid, false);
assert.ok(validateFoodRecord(unknownState).problems.includes('preparation/state is unspecified'));

assert.throws(
  () => createFoodRecord({ id: 'bad', name: 'Bad', per100g: { calories: -1 }, source: { provider: 'x', status: 'x' } }),
  /non-negative/,
);
assert.throws(() => calculateMeal([]), /at least one ingredient/);

console.log('PUMP 3 nutrition engine checks passed');
