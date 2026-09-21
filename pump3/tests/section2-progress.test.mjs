import assert from 'node:assert/strict';
import { CANONICAL_FOODS, CANONICAL_FOOD_BY_LEGACY_ALIAS } from '../src/nutrition/data/canonical-foods.js';

// Section 2 is intentionally not complete yet. This regression gate makes the
// verified-food migration monotonic while the remaining legacy meals are being
// canonicalized. The registry deliberately deduplicates foods that appeared in
// older batches, so the floor tracks unique canonical IDs rather than historical
// batch row count. Raise MIN_VERIFIED_FOODS as each reviewed unique food lands;
// the final gate will require zero unresolved retained meal ingredients.
const MIN_VERIFIED_FOODS = 29;
const REQUIRED_RESOLVED_ALIASES = [
  'ביצים', 'ביצה קשה', 'קוטג׳ 5%', 'גבינה לבנה 5%', 'סלט ירקות',
  'טונה במים', 'טונה במים מסוננת', 'שיבולת שועל', 'קינואה מבושלת',
  'בורגול מבושל', 'רוטב עגבניות', 'קוסקוס מבושל', 'פסטה מבושלת',
  'שמן זית', 'שמן שומשום', 'חמאת בוטנים', 'סלמון אפוי',
  'אורז מבושל', 'חומוס מבושל', 'טופו', 'טופו מפורר', 'טופו צרוב',
  'תפוח אדמה אפוי', 'תפוחי אדמה אפויים',
];

assert.ok(CANONICAL_FOODS.length >= MIN_VERIFIED_FOODS,
  `verified canonical foods regressed below ${MIN_VERIFIED_FOODS}`);

for (const alias of REQUIRED_RESOLVED_ALIASES) {
  assert.ok(CANONICAL_FOOD_BY_LEGACY_ALIAS[alias], `resolved legacy alias regressed: ${alias}`);
}

const ids = CANONICAL_FOODS.map((food) => food.id);
assert.equal(new Set(ids).size, ids.length, 'canonical food IDs must remain unique');

for (const food of CANONICAL_FOODS) {
  assert.ok(food.source?.provider || food.source?.dataset || food.source?.fdcId || food.source?.code,
    `canonical food ${food.id} lost authoritative source metadata`);
  for (const key of ['calories', 'protein', 'carbs', 'fat']) {
    assert.ok(Number.isFinite(food.per100g?.[key]), `${food.id} missing finite per100g.${key}`);
    assert.ok(food.per100g[key] >= 0, `${food.id} has negative per100g.${key}`);
  }
}

console.log(`Section 2 progress gate passed (${CANONICAL_FOODS.length} verified canonical foods)`);
