import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central SR Legacy fallbacks for staple foods where the Israeli
// MOH matcher either returned no safe row or a semantically unrelated recipe.
// Values are per 100 g edible cooked portion and FDC IDs make every value auditable.
const records = Object.freeze({
  pastaCooked: { fdcId: 169737, description: 'Pasta, cooked, enriched, without added salt', calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9 },
  chickpeasCooked: { fdcId: 173757, description: 'Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt', calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  lentilsCooked: { fdcId: 172421, description: 'Lentils, mature seeds, cooked, boiled, without salt', calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4 },
  sweetCornCooked: { fdcId: 169999, description: 'Corn, sweet, yellow, cooked, boiled, drained, without salt', calories: 96, protein: 3.4, carbs: 21.0, fat: 1.5 },
});

export const OFFICIAL_FOODS_V4 = Object.freeze([
  foodFromUsdaRecord(records.pastaCooked, { id: 'pasta-cooked', name: 'פסטה מבושלת', state: 'cooked', aliases: [] }),
  foodFromUsdaRecord(records.chickpeasCooked, { id: 'chickpeas-cooked', name: 'גרגירי חומוס מבושלים', state: 'cooked', aliases: ['חומוס מבושל'] }),
  foodFromUsdaRecord(records.lentilsCooked, { id: 'lentils-cooked', name: 'עדשים מבושלות', state: 'cooked', aliases: [] }),
  foodFromUsdaRecord(records.sweetCornCooked, { id: 'sweet-corn-cooked', name: 'תירס מתוק מבושל', state: 'cooked', aliases: ['תירס'] }),
]);
