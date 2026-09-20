import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central staples pinned to FDC IDs. Values are per 100 g edible
// cooked/ready-to-eat portion. Batch v7 only contains foods not already defined
// by earlier canonical batches; shared staples remain owned by their first batch
// so aliases and IDs stay unique in the registry.
const records = Object.freeze({
  pastaCooked: { fdcId: 168927, description: 'Pasta, cooked, enriched, without added salt', calories: 158, protein: 5.8, carbs: 30.86, fat: 0.93 },
  sweetPotatoBaked: { fdcId: 168483, description: 'Sweet potato, cooked, baked in skin, flesh, without salt', calories: 90, protein: 2.01, carbs: 20.71, fat: 0.15 },
  appleRaw: { fdcId: 171688, description: 'Apples, raw, with skin', calories: 52, protein: 0.26, carbs: 13.81, fat: 0.17 },
});

export const OFFICIAL_FOODS_V7 = Object.freeze([
  foodFromUsdaRecord(records.pastaCooked, { id: 'pasta-cooked', name: 'פסטה מבושלת', state: 'cooked', aliases: [] }),
  foodFromUsdaRecord(records.sweetPotatoBaked, { id: 'sweet-potato-baked', name: 'בטטה אפויה', state: 'baked', aliases: [] }),
  foodFromUsdaRecord(records.appleRaw, { id: 'apple-raw', name: 'תפוח טרי', state: 'raw', aliases: ['תפוח'] }),
]);
