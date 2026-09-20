import assert from 'node:assert/strict';
import { foodFromIsraelMohRow, ISRAEL_MOH_SOURCE } from '../src/nutrition/data/israel-moh-source.js';
import { createFoodRegistry, assertPlanningReady } from '../src/nutrition/data/food-registry.js';
import { calculateFood, roundNutrition, createFoodRecord } from '../src/nutrition/engine/nutrition-engine.js';

const officialFixture = {
  Code: 12345,
  shmmitzrach: 'אורז לבן מבושל - בדיקת מבנה',
  english_name: 'Cooked white rice - schema fixture',
  protein: '2.7',
  total_fat: '0.3',
  carbohydrates: '28.2',
  food_energy: '130',
  tarich_idkun: '2022-10-26',
};

const rice = foodFromIsraelMohRow(officialFixture, {
  id: 'rice-white-cooked-fixture',
  state: 'cooked',
  aliases: ['אורז מבושל'],
});

assert.equal(rice.source.provider, ISRAEL_MOH_SOURCE.provider);
assert.equal(rice.source.status, 'verified');
assert.equal(rice.source.sourceCode, '12345');
assert.deepEqual(roundNutrition(calculateFood(rice, 200), 1), {
  calories: 260,
  protein: 5.4,
  carbs: 56.4,
  fat: 0.6,
});

const registry = createFoodRegistry([rice]);
assert.equal(registry.getById('rice-white-cooked-fixture'), rice);
assert.equal(registry.findByAlias('אורז מבושל'), rice);
assert.equal(registry.findByAlias('  אורז   מבושל '), rice);
assert.equal(assertPlanningReady(rice), rice);

const provisional = createFoodRecord({
  id: 'provisional-food',
  name: 'מזון זמני',
  state: 'prepared',
  per100g: { calories: 100, protein: 5, carbs: 10, fat: 2 },
  source: { provider: 'manual', status: 'provisional' },
});
assert.throws(() => assertPlanningReady(provisional), /not backed by a verified nutrition source/);
assert.throws(() => foodFromIsraelMohRow({ ...officialFixture, Code: '' }, { state: 'cooked' }), /food code/);
assert.throws(() => foodFromIsraelMohRow(officialFixture, {}), /preparation\/state/);

console.log('PUMP 3 official nutrition source adapter checks passed');
