import { createFoodRecord } from '../engine/nutrition-engine.js';

export const ISRAEL_MOH_SOURCE = Object.freeze({
  provider: 'israel-ministry-of-health-national-nutrition-database',
  dataset: 'nutrition-database',
  datasetUrl: 'https://data.gov.il/he/datasets/ministry-health/nutrition-database',
  resource: 'ingredients-and-recipes-per-100g',
  resourceId: 'c3cb0630-0650-46c1-a068-82d575c094b2',
  resourceUrl: 'https://data.gov.il/he/datasets/ministry-health/nutrition-database/c3cb0630-0650-46c1-a068-82d575c094b2',
  basis: 'per-100g',
});

function numberFromDataset(value, field) {
  if (value === null || value === undefined || value === '') return 0;
  const normalized = typeof value === 'string' ? value.replace(',', '.').trim() : value;
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) {
    throw new TypeError(`invalid Ministry of Health value for ${field}`);
  }
  return number;
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function assertMacroPlausibility(per100g, code) {
  for (const [field, value] of Object.entries(per100g)) {
    if (!Number.isFinite(value) || value < 0) throw new TypeError(`invalid ${field} for Ministry of Health food ${code}`);
  }
  if (per100g.protein > 100 || per100g.carbs > 100 || per100g.fat > 100) {
    throw new TypeError(`impossible per-100g macro value for Ministry of Health food ${code}`);
  }
  if (per100g.calories > 1000) throw new TypeError(`impossible calorie density for Ministry of Health food ${code}`);
}

export function foodFromIsraelMohRow(row, { id, state, aliases = [] } = {}) {
  if (!row || typeof row !== 'object') throw new TypeError('Ministry of Health row is required');
  const code = cleanText(row.Code ?? row.code);
  const hebrewName = cleanText(row.shmmitzrach ?? row.name_he ?? row.name);
  const englishName = cleanText(row.english_name ?? row.name_en);
  if (!code) throw new TypeError('Ministry of Health food code is required');
  if (!hebrewName) throw new TypeError('Ministry of Health food name is required');
  if (!state || state === 'unspecified') throw new TypeError('canonical preparation/state is required');

  const per100g = {
    calories: numberFromDataset(row.food_energy, 'food_energy'),
    protein: numberFromDataset(row.protein, 'protein'),
    carbs: numberFromDataset(row.carbohydrates, 'carbohydrates'),
    fat: numberFromDataset(row.total_fat, 'total_fat'),
  };
  assertMacroPlausibility(per100g, code);

  return createFoodRecord({
    id: id || `moh-il-${code}`,
    name: hebrewName,
    aliases: [...new Set([englishName, ...aliases].filter(Boolean))],
    state,
    per100g,
    source: {
      ...ISRAEL_MOH_SOURCE,
      status: 'verified',
      sourceCode: code,
      sourceUpdatedAt: cleanText(row.tarich_idkun) || null,
      originalHebrewName: hebrewName,
      originalEnglishName: englishName || null,
    },
  });
}
