const NUTRIENTS = ['calories', 'protein', 'carbs', 'fat'];

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new TypeError(`${label} must be a finite non-negative number`);
  }
  return number;
}

export function createFoodRecord({
  id,
  name,
  per100g,
  source,
  state = 'unspecified',
  aliases = [],
}) {
  if (!id || typeof id !== 'string') throw new TypeError('food id is required');
  if (!name || typeof name !== 'string') throw new TypeError('food name is required');
  if (!per100g || typeof per100g !== 'object') throw new TypeError('per100g is required');
  if (!source?.provider || !source?.status) {
    throw new TypeError('every food record must declare source.provider and source.status');
  }

  const normalized = {};
  for (const nutrient of NUTRIENTS) {
    normalized[nutrient] = finiteNumber(per100g[nutrient] ?? 0, `per100g.${nutrient}`);
  }

  return Object.freeze({
    id,
    name,
    aliases: Object.freeze([...aliases]),
    state,
    per100g: Object.freeze(normalized),
    source: Object.freeze({ ...source }),
  });
}

export function calculateFood(food, grams) {
  const amount = finiteNumber(grams, 'grams');
  if (!food?.per100g) throw new TypeError('canonical food record is required');
  const factor = amount / 100;

  return {
    foodId: food.id,
    name: food.name,
    grams: amount,
    calories: food.per100g.calories * factor,
    protein: food.per100g.protein * factor,
    carbs: food.per100g.carbs * factor,
    fat: food.per100g.fat * factor,
    source: food.source,
  };
}

export function calculateMeal(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('meal must include at least one ingredient');
  }

  const ingredients = items.map(({ food, grams }) => calculateFood(food, grams));
  const totals = ingredients.reduce(
    (sum, item) => {
      for (const nutrient of NUTRIENTS) sum[nutrient] += item[nutrient];
      return sum;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return { ingredients, totals };
}

export function roundNutrition(values, digits = 1) {
  const scale = 10 ** digits;
  return Object.fromEntries(
    NUTRIENTS.map((nutrient) => [nutrient, Math.round((values[nutrient] ?? 0) * scale) / scale]),
  );
}

export function compareToTarget(actual, target) {
  const delta = {};
  for (const nutrient of NUTRIENTS) {
    const goal = finiteNumber(target?.[nutrient] ?? 0, `target.${nutrient}`);
    const current = finiteNumber(actual?.[nutrient] ?? 0, `actual.${nutrient}`);
    delta[nutrient] = current - goal;
  }
  return delta;
}

export function validateFoodRecord(food) {
  const problems = [];
  if (!food?.source?.provider) problems.push('missing source provider');
  if (!food?.source?.status) problems.push('missing source status');
  if (!food?.state || food.state === 'unspecified') problems.push('preparation/state is unspecified');
  for (const nutrient of NUTRIENTS) {
    if (!Number.isFinite(Number(food?.per100g?.[nutrient]))) problems.push(`invalid ${nutrient}`);
  }
  return { valid: problems.length === 0, problems };
}
