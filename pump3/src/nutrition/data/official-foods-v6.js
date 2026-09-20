import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central SR Legacy staples. Values are per 100 g edible,
// cooked/ready-to-eat portion and are pinned to FDC IDs to avoid fuzzy matches.
const records = Object.freeze({
  chickpeasCooked: { fdcId: 173757, description: 'Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt', calories: 164, protein: 8.86, carbs: 27.42, fat: 2.59 },
  lentilsCooked: { fdcId: 172421, description: 'Lentils, mature seeds, cooked, boiled, without salt', calories: 116, protein: 9.02, carbs: 20.13, fat: 0.38 },
  cornCooked: { fdcId: 169999, description: 'Corn, sweet, yellow, cooked, boiled, drained, without salt', calories: 96, protein: 3.41, carbs: 21.0, fat: 1.5 },
});

export const OFFICIAL_FOODS_V6 = Object.freeze([
  foodFromUsdaRecord(records.chickpeasCooked, { id: 'chickpeas-cooked', name: 'גרגירי חומוס מבושלים', state: 'cooked-boiled', aliases: ['חומוס מבושל'] }),
  foodFromUsdaRecord(records.lentilsCooked, { id: 'lentils-cooked', name: 'עדשים מבושלות', state: 'cooked-boiled', aliases: [] }),
  foodFromUsdaRecord(records.cornCooked, { id: 'corn-sweet-cooked', name: 'תירס מתוק מבושל', state: 'cooked-boiled', aliases: ['תירס'] }),
]);
