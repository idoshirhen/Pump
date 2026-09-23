import { validateFoodRecord } from '../engine/nutrition-engine.js';

function normalizeAlias(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[״”]/g, '"')
    .replace(/[׳’]/g, "'")
    .toLocaleLowerCase('he');
}

export function createFoodRegistry(records = []) {
  const byId = new Map();
  const byAlias = new Map();

  function add(food) {
    const validation = validateFoodRecord(food);
    if (!validation.valid) throw new TypeError(`invalid food ${food?.id ?? '<unknown>'}: ${validation.problems.join(', ')}`);
    if (byId.has(food.id)) throw new TypeError(`duplicate food id: ${food.id}`);

    const aliases = [food.name, ...(food.aliases ?? [])];
    for (const alias of aliases) {
      const key = normalizeAlias(alias);
      if (!key) continue;
      const existing = byAlias.get(key);
      if (existing && existing.id !== food.id) {
        throw new TypeError(`duplicate food alias: ${alias}`);
      }
    }

    byId.set(food.id, food);
    for (const alias of aliases) {
      const key = normalizeAlias(alias);
      if (key) byAlias.set(key, food);
    }
    return food;
  }

  for (const food of records) add(food);

  return Object.freeze({
    add,
    getById(id) { return byId.get(id) ?? null; },
    findByAlias(alias) { return byAlias.get(normalizeAlias(alias)) ?? null; },
    all() { return [...byId.values()]; },
    size() { return byId.size; },
  });
}

export function assertPlanningReady(food) {
  const validation = validateFoodRecord(food);
  if (!validation.valid) throw new TypeError(`food is not valid: ${validation.problems.join(', ')}`);
  if (food.source.status !== 'verified' && food.source.status !== 'verified-test') {
    throw new TypeError(`food ${food.id} is not backed by a verified nutrition source`);
  }
  return food;
}
