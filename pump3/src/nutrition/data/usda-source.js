import { createFoodRecord } from '../engine/nutrition-engine.js';

export const USDA_SOURCE = Object.freeze({
  provider: 'usda-fooddata-central',
  dataset: 'sr-legacy',
  datasetUrl: 'https://fdc.nal.usda.gov/',
  basis: 'per-100g',
});

function number(value, field) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new TypeError(`invalid USDA value for ${field}`);
  return parsed;
}

export function foodFromUsdaRecord(record, { id, name, state, aliases = [] } = {}) {
  if (!record?.fdcId) throw new TypeError('USDA FDC id is required');
  if (!name) throw new TypeError('canonical Hebrew name is required');
  if (!state || state === 'unspecified') throw new TypeError('canonical preparation/state is required');
  const per100g = {
    calories: number(record.calories, 'calories'),
    protein: number(record.protein, 'protein'),
    carbs: number(record.carbs, 'carbs'),
    fat: number(record.fat, 'fat'),
  };
  if (per100g.protein > 100 || per100g.carbs > 100 || per100g.fat > 100 || per100g.calories > 1000) {
    throw new TypeError(`impossible USDA per-100g value for ${record.fdcId}`);
  }
  return createFoodRecord({
    id: id || `usda-${record.fdcId}`,
    name,
    aliases: [...new Set([record.description, ...aliases].filter(Boolean))],
    state,
    per100g,
    source: {
      ...USDA_SOURCE,
      status: 'verified',
      sourceCode: String(record.fdcId),
      sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${record.fdcId}/nutrients`,
      originalEnglishName: record.description,
    },
  });
}
