import { OFFICIAL_FOODS_V1 } from './official-foods-v1.js';
import { OFFICIAL_FOODS_V2 } from './official-foods-v2.js';
import { OFFICIAL_FOODS_V3 } from './official-foods-v3.js';

export const CANONICAL_FOODS = Object.freeze([
  ...OFFICIAL_FOODS_V1,
  ...OFFICIAL_FOODS_V2,
  ...OFFICIAL_FOODS_V3,
]);

export const CANONICAL_FOOD_BY_LEGACY_ALIAS = Object.freeze(Object.fromEntries(
  CANONICAL_FOODS.flatMap((food) => [food.name, ...(food.aliases ?? [])].map((alias) => [alias, food.id])),
));

export const CANONICAL_FOOD_BY_ID = Object.freeze(Object.fromEntries(
  CANONICAL_FOODS.map((food) => [food.id, food]),
));
