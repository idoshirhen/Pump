import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central SR Legacy staples, pinned to FDC IDs and explicit
// preparation states. These replace ambiguous legacy labels with one canonical
// cooked/ready-to-eat interpretation used by PUMP meal calculations.
const records = Object.freeze({
  riceCooked: { fdcId: 169756, description: 'Rice, white, long-grain, regular, enriched, cooked', calories: 130, protein: 2.69, carbs: 28.17, fat: 0.28 },
  chickpeasCooked: { fdcId: 173757, description: 'Chickpeas (garbanzo beans), mature seeds, cooked, boiled, without salt', calories: 164, protein: 8.86, carbs: 27.42, fat: 2.59 },
  tofuFirm: { fdcId: 172475, description: 'Tofu, raw, firm, prepared with calcium sulfate', calories: 144, protein: 17.27, carbs: 2.78, fat: 8.72 },
  potatoBaked: { fdcId: 170093, description: 'Potatoes, baked, flesh and skin, without salt', calories: 93, protein: 2.5, carbs: 21.15, fat: 0.13 },
});

export const OFFICIAL_FOODS_V8 = Object.freeze([
  foodFromUsdaRecord(records.riceCooked, { id: 'rice-white-cooked', name: 'אורז מבושל', state: 'cooked', aliases: [] }),
  foodFromUsdaRecord(records.chickpeasCooked, { id: 'chickpeas-cooked', name: 'חומוס מבושל', state: 'cooked', aliases: [] }),
  foodFromUsdaRecord(records.tofuFirm, { id: 'tofu-firm', name: 'טופו', state: 'ready-to-eat', aliases: ['טופו מפורר', 'טופו צרוב'] }),
  foodFromUsdaRecord(records.potatoBaked, { id: 'potato-baked', name: 'תפוח אדמה אפוי', state: 'baked', aliases: ['תפוחי אדמה אפויים'] }),
]);
