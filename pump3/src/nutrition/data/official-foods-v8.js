import { foodFromUsdaRecord } from './usda-source.js';

// USDA FoodData Central SR Legacy staple not already owned by earlier batches.
// Keeping ownership unique prevents duplicate IDs/aliases in the deterministic
// canonical registry.
const records = Object.freeze({
  chickpeasCooked: { fdcId: 173757, description: 'Chickpeas (garbanzo beans), mature seeds, cooked, boiled, without salt', calories: 164, protein: 8.86, carbs: 27.42, fat: 2.59 },
});

export const OFFICIAL_FOODS_V8 = Object.freeze([
  foodFromUsdaRecord(records.chickpeasCooked, { id: 'chickpeas-cooked', name: 'חומוס מבושל', state: 'cooked', aliases: [] }),
]);
