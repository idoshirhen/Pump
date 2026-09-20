import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { CANONICAL_FOOD_BY_LEGACY_ALIAS } from '../pump3/src/nutrition/data/canonical-foods.js';

const source = await readFile('scripts/pump-catalog-helpers.js', 'utf8');

// The catalogue is intentionally one pumpCatalogEntry call per line. Parsing by line is
// safer here than trying to evaluate the legacy helper in Node just for an audit.
const meals = [];
for (const line of source.split('\n')) {
  if (!line.includes('pumpCatalogEntry(')) continue;

  const id = line.match(/pumpCatalogEntry\('([^']+)'/)?.[1];
  const title = line.match(/pumpCatalogEntry\('[^']+'\s*,\s*\[[^\]]*\]\s*,\s*'([^']+)'/)?.[1];
  const ingredients = [...line.matchAll(/pumpIngredient\('([^']+)'/g)].map((item) => item[1]);
  if (!id || !title || !ingredients.length) continue;

  const verified = [];
  const unverified = [];
  for (const label of ingredients) {
    const foodId = CANONICAL_FOOD_BY_LEGACY_ALIAS[label];
    if (foodId) verified.push({ label, foodId });
    else unverified.push(label);
  }

  meals.push({
    id,
    title,
    ingredients,
    verified,
    unverified,
    planningReady: unverified.length === 0,
  });
}

if (meals.length < 60) throw new Error(`Expected a large meal catalogue; parsed only ${meals.length}`);

const ready = meals.filter((meal) => meal.planningReady);
const blocked = meals.filter((meal) => !meal.planningReady);
const unresolvedLabels = [...new Set(blocked.flatMap((meal) => meal.unverified))]
  .sort((a, b) => a.localeCompare(b, 'he'));

console.log(`PUMP 3 meal verification audit: ${meals.length} meals parsed`);
console.log(`Planning-ready meals using verified nutrition only: ${ready.length}`);
console.log(`Blocked until all ingredient nutrition is verified: ${blocked.length}`);
console.log(`Unique unresolved ingredient labels still affecting meals: ${unresolvedLabels.length}`);

if (ready.length) console.table(ready.map(({ id, title }) => ({ id, title })));
console.table(unresolvedLabels.map((label) => ({ label })));

for (const meal of ready) {
  if (meal.unverified.length) throw new Error(`Meal ${meal.id} was marked ready with unresolved ingredients`);
  if (meal.verified.length !== meal.ingredients.length) {
    throw new Error(`Meal ${meal.id} verification count does not match its ingredient count`);
  }
}

await mkdir('pump3/audit', { recursive: true });
await writeFile('pump3/audit/meal-verification.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  counts: {
    meals: meals.length,
    ready: ready.length,
    blocked: blocked.length,
    unresolvedLabels: unresolvedLabels.length,
  },
  ready,
  blocked,
  unresolvedLabels,
}, null, 2));
