# PUMP 3 — Nutrition data policy

## Goal
Every calorie and macro value shown by PUMP 3 must be traceable to a defined ingredient, a defined edible state, a defined unit/weight, and a named data source.

## Rules

1. No anonymous nutrition constants in UI code.
2. Every canonical ingredient gets a stable ID independent of its Hebrew/English display name.
3. Values are stored per 100 g (or per 100 ml when appropriate). Portion values are derived from that base.
4. Cooked/raw state must be explicit when it changes nutrition materially (for example rice, pasta, legumes and meat).
5. Generic labels such as "vegetables", "white fish", "cheese 5%" or "fruit" may be used for UI grouping, but cannot be the final nutrition source record unless a documented representative profile is intentionally defined.
6. Recipe calories/macros are calculated from ingredient quantities. They are not manually typed independently of the ingredients.
7. A source record must include source name, source item/reference ID when available, retrieval/version date, and verification status.
8. User-facing rounded values are derived from unrounded internal totals.
9. Dietary filters and allergens are metadata on canonical ingredients/recipes, not inferred from recipe titles.
10. Existing PUMP 2 values are considered `legacy_unverified` until migrated and checked.

## Source priority

1. Israeli Ministry of Health / national nutrition database when a suitable item exists.
2. Other official government food-composition databases for missing items.
3. Manufacturer label for a specific branded food.
4. Documented recipe calculation for prepared dishes.

## Verification states

- `verified`: source and food state checked.
- `provisional`: source exists but mapping/portion still needs review.
- `legacy_unverified`: inherited from PUMP 2 and must not become a PUMP 3 canonical source silently.
- `blocked`: ambiguous item that must be split or defined before use.

## Required fields for a canonical ingredient

- `id`
- `name.he`
- `name.en`
- `state`
- `basis`
- `nutrition.calories`
- `nutrition.protein`
- `nutrition.carbs`
- `nutrition.fat`
- `source.name`
- `source.reference`
- `source.checkedAt`
- `status`

## Migration rule
PUMP 3 can reuse a PUMP 2 recipe only after every nutrition-bearing ingredient in that recipe resolves to a canonical ingredient record. Until then the recipe remains visible only in the legacy audit, not in the trusted PUMP 3 catalog.
