import { OFFICIAL_FOODS_V1 } from './official-foods-v1.js';
import { OFFICIAL_FOODS_V2 } from './official-foods-v2.js';
import { OFFICIAL_FOODS_V5 } from './official-foods-v5.js';
import { OFFICIAL_FOODS_V6 } from './official-foods-v6.js';
import { OFFICIAL_FOODS_V7 } from './official-foods-v7.js';

// V3 and V4 are intentionally excluded. Their USDA fallback staples were
// superseded by corrected/pinned V5-V7 records. Keeping either older batch in
// the registry creates duplicate IDs/aliases and makes lookup order determine
// nutrition, which is unacceptable for deterministic meal calculations.
export const CANONICAL_FOODS = Object.freeze([
  ...OFFICIAL_FOODS_V1,
  ...OFFICIAL_FOODS_V2,
  ...OFFICIAL_FOODS_V5,
  ...OFFICIAL_FOODS_V6,
  ...OFFICIAL_FOODS_V7,
]);

export const CANONICAL_FOOD_BY_LEGACY_ALIAS = Object.freeze(Object.fromEntries(
  CANONICAL_FOODS.flatMap((food) => [food.name, ...(food.aliases ?? [])].map((alias) => [alias, food.id])),
));

export const CANONICAL_FOOD_BY_ID = Object.freeze(Object.fromEntries(
  CANONICAL_FOODS.map((food) => [food.id, food]),
));
