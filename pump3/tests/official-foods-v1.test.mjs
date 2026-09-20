import assert from 'node:assert/strict';
import { OFFICIAL_FOODS_V1, OFFICIAL_FOOD_BY_LEGACY_ALIAS } from '../src/nutrition/data/official-foods-v1.js';
import { createFoodRegistry, assertPlanningReady } from '../src/nutrition/data/food-registry.js';

assert.equal(OFFICIAL_FOODS_V1.length, 7, 'first canonical batch should contain seven manually reviewed foods');
const registry = createFoodRegistry(OFFICIAL_FOODS_V1);
assert.equal(registry.size(), 7);
for (const food of OFFICIAL_FOODS_V1) {
  assert.equal(food.source.provider, 'israel-ministry-of-health-national-nutrition-database');
  assert.equal(food.source.status, 'verified');
  assert.ok(food.source.sourceCode, `official source code required for ${food.id}`);
  assertPlanningReady(food);
}

assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['שמן זית'], 'olive-oil');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['שמן שומשום'], 'sesame-oil');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['חמאת בוטנים'], 'peanut-butter');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['ביצה'], 'whole-egg');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['ביצה קשה'], 'hard-boiled-egg');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['סלמון אפוי'], 'salmon-baked');
assert.equal(OFFICIAL_FOOD_BY_LEGACY_ALIAS['קוסקוס מבושל'], 'couscous-cooked');

console.log('PUMP 3 first official canonical food batch checks passed');
