import { foodFromUsdaRecord } from './usda-source.js';

// Authoritative fallback batch for foods whose legacy PUMP label did not have a
// semantically safe Ministry-of-Health match. Values are USDA FoodData Central
// SR Legacy per 100 g edible portion. FDC IDs make every promoted value auditable.
const records = Object.freeze({
  cookedWhiteRice: { fdcId: 169753, description: 'Rice, white, long-grain, regular, cooked, enriched, with salt', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  roastedChickenBreast: { fdcId: 171477, description: 'Chicken, broilers or fryers, breast, meat only, cooked, roasted', calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
  bakedPotato: { fdcId: 170093, description: 'Potatoes, baked, flesh and skin, without salt', calories: 93, protein: 2.5, carbs: 21.2, fat: 0.1 },
  firmTofu: { fdcId: 172475, description: 'Tofu, raw, firm, prepared with calcium sulfate', calories: 144, protein: 17.3, carbs: 2.8, fat: 8.7 },
});

export const OFFICIAL_FOODS_V3 = Object.freeze([
  foodFromUsdaRecord(records.cookedWhiteRice, { id: 'rice-white-cooked', name: 'אורז לבן מבושל', state: 'cooked', aliases: ['אורז מבושל'] }),
  foodFromUsdaRecord(records.roastedChickenBreast, { id: 'chicken-breast-roasted', name: 'חזה עוף צלוי ללא עור', state: 'roasted', aliases: ['חזה עוף מבושל', 'חזה עוף'] }),
  foodFromUsdaRecord(records.bakedPotato, { id: 'potato-baked', name: 'תפוח אדמה אפוי עם קליפה', state: 'baked', aliases: ['תפוח אדמה אפוי', 'תפוחי אדמה אפויים'] }),
  foodFromUsdaRecord(records.firmTofu, { id: 'tofu-firm', name: 'טופו קשה', state: 'raw', aliases: ['טופו'] }),
]);
