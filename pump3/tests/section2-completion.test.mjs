import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CANONICAL_FOODS, CANONICAL_FOOD_BY_ID, CANONICAL_FOOD_BY_LEGACY_ALIAS } from '../src/nutrition/data/canonical-foods.js';
import { RETAINED_MEALS, materializeMealTemplate } from '../src/nutrition/data/meal-catalog.js';
import { LEGACY_NUTRITION_POLICY } from '../src/nutrition/migration/legacy-nutrition-policy.js';
import { assertPlanningReady } from '../src/nutrition/data/food-registry.js';
import { planDailyNutrition } from '../src/nutrition/engine/day-planner.js';

// 1) Runtime nutrition may only use authoritative, planning-ready canonical foods.
assert.ok(CANONICAL_FOODS.length >= 37, 'canonical library unexpectedly shrank');
for (const food of CANONICAL_FOODS) {
  assertPlanningReady(food);
  assert.ok(food.source?.provider, `missing provider for ${food.id}`);
  assert.equal(food.source?.status, 'verified', `unverified source for ${food.id}`);
  assert.ok(food.source?.sourceCode || food.source?.fdcId || food.source?.recordId, `missing pinned source identifier for ${food.id}`);
}

// 2) PUMP 3 retained meals are ingredient-first. No displayed macro can be hard-coded.
assert.equal(RETAINED_MEALS.length, 24, 'expected 24 retained PUMP 3 meal templates');
const ids = new Set();
const slots = new Map();
for (const template of RETAINED_MEALS) {
  assert.ok(!ids.has(template.id), `duplicate meal id ${template.id}`);
  ids.add(template.id);
  assert.ok(['breakfast', 'lunch', 'dinner', 'snack'].includes(template.slot));
  slots.set(template.slot, (slots.get(template.slot) ?? 0) + 1);
  for (const forbidden of ['calories', 'protein', 'carbs', 'fat']) {
    assert.equal(Object.hasOwn(template, forbidden), false, `${template.id} hard-codes ${forbidden}`);
  }
  assert.ok(template.items.length >= 2, `${template.id} needs at least two ingredients`);
  assert.ok(template.items.some((entry) => entry.proteinScalable), `${template.id} needs a protein anchor`);
  for (const entry of template.items) {
    assert.ok(CANONICAL_FOOD_BY_ID[entry.foodId], `${template.id} references unknown ${entry.foodId}`);
    assert.ok(Number.isFinite(entry.grams) && entry.grams > 0, `${template.id}/${entry.foodId} must use grams`);
  }
  const materialized = materializeMealTemplate(template);
  assert.ok(materialized.meal.totals.calories > 0, `${template.id} calculated zero calories`);
  assert.ok(materialized.meal.totals.protein > 0, `${template.id} calculated zero protein`);
}
for (const slot of ['breakfast', 'lunch', 'dinner', 'snack']) {
  assert.equal(slots.get(slot), 6, `expected six retained meals for ${slot}`);
}
assert.ok(RETAINED_MEALS.some((m) => m.tags.includes('vegan')), 'vegan coverage required');
assert.ok(RETAINED_MEALS.some((m) => m.tags.includes('vegetarian')), 'vegetarian coverage required');
assert.ok(RETAINED_MEALS.some((m) => m.tags.includes('meat')), 'meat coverage required');
assert.ok(RETAINED_MEALS.some((m) => m.tags.includes('fish')), 'fish coverage required');

// 3) Every still-unverified legacy label is explicitly quarantined/split/recipe-defined.
const legacySource = await readFile('scripts/pump-catalog-helpers.js', 'utf8');
const legacyLabels = [...new Set([...legacySource.matchAll(/pumpIngredient\('([^']+)'/g)].map((match) => match[1]))];
const unresolved = legacyLabels.filter((label) => !CANONICAL_FOOD_BY_LEGACY_ALIAS[label]).sort((a, b) => a.localeCompare(b, 'he'));
const policyLabels = Object.keys(LEGACY_NUTRITION_POLICY).sort((a, b) => a.localeCompare(b, 'he'));
assert.deepEqual(policyLabels, unresolved, 'legacy unresolved labels must be fully accounted for by migration policy');
for (const [label, policy] of Object.entries(LEGACY_NUTRITION_POLICY)) {
  assert.ok(['quarantine', 'split-required', 'recipe-required'].includes(policy.action), `invalid migration action for ${label}`);
}
for (const template of RETAINED_MEALS) {
  for (const entry of template.items) {
    assert.ok(!LEGACY_NUTRITION_POLICY[entry.foodId], `runtime meal leaks quarantined legacy item ${entry.foodId}`);
  }
}

// 4) Deterministic day planner must hit realistic calorie/protein targets for
// omnivore and vegan users using only computed ingredient nutrition.
const scenarios = [
  { diet: 'omnivore', calories: 1800, protein: 105 },
  { diet: 'omnivore', calories: 2200, protein: 130 },
  { diet: 'omnivore', calories: 2600, protein: 150 },
  { diet: 'vegan', calories: 2000, protein: 95 },
  { diet: 'vegan', calories: 2400, protein: 110 },
];
for (const scenario of scenarios) {
  const first = planDailyNutrition(scenario, { diet: scenario.diet, seed: 3 });
  const second = planDailyNutrition(scenario, { diet: scenario.diet, seed: 3 });
  assert.deepEqual(first, second, `day plan must be deterministic for ${JSON.stringify(scenario)}`);
  assert.equal(first.meals.length, 4);
  assert.ok(first.validation.caloriesOk, `daily calories miss target for ${JSON.stringify(scenario)}: ${first.validation.calorieDelta}`);
  assert.ok(first.validation.proteinOk, `daily protein misses target for ${JSON.stringify(scenario)}: ${first.validation.proteinDelta}`);
}

console.log(`PUMP 3 section 2 completion contract passed: ${CANONICAL_FOODS.length} verified foods, ${RETAINED_MEALS.length} retained meals, ${unresolved.length} legacy labels quarantined/migrated.`);
