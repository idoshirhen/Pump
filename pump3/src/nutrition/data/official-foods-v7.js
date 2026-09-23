import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central staples pinned to FDC IDs. Values are per 100 g edible
// cooked/ready-to-eat portion. Batch v7 only contains foods not already defined
// by earlier canonical batches; shared staples remain owned by their first batch
// so aliases and IDs stay unique in the registry.
const records = Object.freeze({
  pastaCooked: { fdcId: 168927, description: 'Pasta, cooked, enriched, without added salt', calories: 158, protein: 5.8, carbs: 30.86, fat: 0.93 },
});

export const OFFICIAL_FOODS_V7 = Object.freeze([
  foodFromUsdaRecord(records.pastaCooked, { id: 'pasta-cooked', name: 'פסטה מבושלת', state: 'cooked', aliases: [] }),
]);
