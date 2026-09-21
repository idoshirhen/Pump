import assert from 'node:assert/strict';
import { CANONICAL_FOODS, CANONICAL_FOOD_BY_ID, CANONICAL_FOOD_BY_LEGACY_ALIAS } from '../src/nutrition/data/canonical-foods.js';
import { createFoodRegistry, assertPlanningReady } from '../src/nutrition/data/food-registry.js';

// Do not assert an arbitrary historical batch size here: superseding duplicate
// source rows can legitimately make the canonical library smaller. The useful
// regression contract is that every canonical ID/alias is unique, verified and
// planning-ready, and that the legacy staples required by the meal catalogue
// continue to resolve deterministically.
assert.ok(CANONICAL_FOODS.length > 0, 'canonical food library must not be empty');
const registry = createFoodRegistry(CANONICAL_FOODS);
assert.equal(registry.size(), CANONICAL_FOODS.length, 'canonical food IDs must be unique');

const allowedProviders = new Set([
  'israel-ministry-of-health-national-nutrition-database',
  'usda-fooddata-central',
]);

const seenAliases = new Map();
for (const food of CANONICAL_FOODS) {
  assert.equal(food.source.status, 'verified');
  assert.ok(allowedProviders.has(food.source.provider), `unapproved source provider for ${food.id}: ${food.source.provider}`);
  assert.ok(food.source.sourceCode, `missing source code for ${food.id}`);
  assertPlanningReady(food);
  assert.equal(CANONICAL_FOOD_BY_ID[food.id], food);

  for (const alias of [food.name, ...(food.aliases ?? [])]) {
    const prior = seenAliases.get(alias);
    assert.ok(!prior || prior === food.id, `canonical alias collision for ${alias}: ${prior} vs ${food.id}`);
    seenAliases.set(alias, food.id);
  }
}

const requiredAliases = {
  'ביצים': 'whole-egg',
  'קוטג׳ 5%': 'cottage-5',
  'גבינה לבנה 5%': 'white-cheese-5',
  'סלט ירקות': 'israeli-salad-no-oil',
  'גבינה צהובה 9%': 'yellow-cheese-9',
  'שיבולת שועל': 'oats-raw',
  'גבינה בולגרית 5%': 'bulgarian-cheese-5',
  'גבינה מלוחה 5%': 'salty-cheese-5',
  'תמרים': 'dates-dried-pitted',
  'קינואה מבושלת': 'quinoa-cooked',
  'בורגול מבושל': 'bulgur-cooked',
  'רוטב עגבניות': 'tomato-sauce-no-oil',
  'טונה במים': 'tuna-canned-water',
  'טונה במים מסוננת': 'tuna-canned-water',
  'אורז מבושל': 'rice-cooked',
  'תפוח אדמה אפוי': 'potato-baked',
  'חזה עוף מבושל': 'chicken-breast-roasted',
  'טופו': 'tofu-firm',
  'תפוח': 'apple-raw',
  'חומוס מבושל': 'chickpeas-cooked',
  'עדשים מבושלות': 'lentils-cooked',
  'תירס': 'corn-sweet-cooked',
  'פסטה מבושלת': 'pasta-cooked',
};

for (const [alias, id] of Object.entries(requiredAliases)) {
  assert.equal(CANONICAL_FOOD_BY_LEGACY_ALIAS[alias], id, `bad canonical mapping for ${alias}`);
}

console.log(`PUMP 3 canonical food library checks passed (${CANONICAL_FOODS.length} verified foods)`);
