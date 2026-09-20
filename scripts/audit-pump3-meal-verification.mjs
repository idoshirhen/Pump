import { readFile } from 'node:fs/promises';
import { OFFICIAL_FOOD_BY_LEGACY_ALIAS } from '../pump3/src/nutrition/data/official-foods-v1.js';

const source = await readFile('scripts/pump-catalog-helpers.js', 'utf8');

const entryPattern = /pumpCatalogEntry\('([^']+)'[\s\S]*?,\s*'([^']+)'[\s\S]*?\[(.*?)\]\)\s*,?/g;
const ingredientPattern = /pumpIngredient\('([^']+)'/g;

const meals = [];
for (const match of source.matchAll(entryPattern)) {
  const [, id, title, ingredientBlock] = match;
  const ingredients = [...ingredientBlock.matchAll(ingredientPattern)].map((item) => item[1]);
  if (!ingredients.length) continue;

  const verified = [];
  const unverified = [];
  for (const label of ingredients) {
    const foodId = OFFICIAL_FOOD_BY_LEGACY_ALIAS[label];
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

if (!meals.length) throw new Error('Could not parse any meal catalogue entries');

const ready = meals.filter((meal) => meal.planningReady);
const blocked = meals.filter((meal) => !meal.planningReady);
const unresolvedLabels = [...new Set(blocked.flatMap((meal) => meal.unverified))].sort((a, b) => a.localeCompare(b, 'he'));

console.log(`PUMP 3 meal verification audit: ${meals.length} meals parsed`);
console.log(`Planning-ready meals using verified nutrition only: ${ready.length}`);
console.log(`Blocked until all ingredient nutrition is verified: ${blocked.length}`);
console.log(`Unique unresolved ingredient labels still affecting meals: ${unresolvedLabels.length}`);

if (ready.length) console.table(ready.map(({ id, title }) => ({ id, title })));
console.table(unresolvedLabels.map((label) => ({ label })));

// Safety contract: no meal is considered ready unless every ingredient resolves to a
// verified canonical food. This intentionally keeps most legacy meals blocked while
// source verification is incomplete instead of falling back to hand-entered macros.
for (const meal of ready) {
  if (meal.unverified.length) throw new Error(`Meal ${meal.id} was marked ready with unresolved ingredients`);
}

await import('node:fs/promises').then(({ mkdir, writeFile }) =>
  mkdir('pump3/audit', { recursive: true }).then(() =>
    writeFile('pump3/audit/meal-verification.json', JSON.stringify({
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
  }),
);
