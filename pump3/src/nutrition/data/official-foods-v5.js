import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central SR Legacy staples used to replace legacy labels that
// were either unmatched or dangerously mismatched by fuzzy MOH search.
// All values are per 100 g edible cooked/ready-to-eat portion.
const records = Object.freeze({
  riceCooked: { fdcId: 168878, description: 'Rice, white, long-grain, regular, enriched, cooked', calories: 130, protein: 2.69, carbs: 28.17, fat: 0.28 },
  potatoBaked: { fdcId: 170026, description: 'Potatoes, baked, flesh and skin, without salt', calories: 93, protein: 2.5, carbs: 21.15, fat: 0.13 },
  sweetPotatoBaked: { fdcId: 168483, description: 'Sweet potato, cooked, baked in skin, flesh, without salt', calories: 90, protein: 2.01, carbs: 20.71, fat: 0.15 },
  chickenBreastRoasted: { fdcId: 171077, description: 'Chicken, broilers or fryers, breast, meat only, cooked, roasted', calories: 165, protein: 31.02, carbs: 0, fat: 3.57 },
  tofuFirm: { fdcId: 172475, description: 'Tofu, raw, firm, prepared with calcium sulfate', calories: 144, protein: 17.3, carbs: 2.78, fat: 8.72 },
  appleRaw: { fdcId: 171688, description: 'Apples, raw, with skin', calories: 52, protein: 0.26, carbs: 13.81, fat: 0.17 },
});

export const OFFICIAL_FOODS_V5 = Object.freeze([
  foodFromUsdaRecord(records.riceCooked, { id: 'rice-cooked', name: 'אורז לבן מבושל', state: 'cooked', aliases: ['אורז מבושל'] }),
  foodFromUsdaRecord(records.potatoBaked, { id: 'potato-baked', name: 'תפוח אדמה אפוי', state: 'baked', aliases: ['תפוחי אדמה אפויים'] }),
  foodFromUsdaRecord(records.sweetPotatoBaked, { id: 'sweet-potato-baked', name: 'בטטה אפויה', state: 'baked', aliases: [] }),
  foodFromUsdaRecord(records.chickenBreastRoasted, { id: 'chicken-breast-roasted', name: 'חזה עוף צלוי', state: 'cooked-roasted', aliases: ['חזה עוף מבושל', 'חזה עוף'] }),
  foodFromUsdaRecord(records.tofuFirm, { id: 'tofu-firm', name: 'טופו קשה', state: 'ready-to-cook', aliases: ['טופו', 'טופו מפורר', 'טופו צרוב'] }),
  foodFromUsdaRecord(records.appleRaw, { id: 'apple-raw', name: 'תפוח עץ טרי', state: 'raw', aliases: ['תפוח'] }),
]);
