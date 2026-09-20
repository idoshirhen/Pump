import { readFile } from 'node:fs/promises';
import { summarizeLegacyFoodLabels } from '../pump3/src/nutrition/migration/legacy-food-classifier.js';

const legacySource = await readFile('scripts/pump-catalog-helpers.js', 'utf8');
const labels = [...legacySource.matchAll(/pumpIngredient\('([^']+)'/g)].map((match) => match[1]);
const summary = summarizeLegacyFoodLabels(labels);

if (summary.total < 80) {
  throw new Error(`Expected the legacy catalog to expose roughly 88 unique ingredients; found ${summary.total}`);
}
if (summary.ready.length + summary.needsState.length + summary.blocked.length !== summary.total) {
  throw new Error('Every legacy ingredient must have an explicit migration classification');
}

console.log(`PUMP 3 legacy food migration inventory: ${summary.total} unique labels`);
console.log(`Ready for official source matching: ${summary.ready.length}`);
console.log(`Need explicit preparation state first: ${summary.needsState.length}`);
console.log(`Blocked by ambiguous legacy naming: ${summary.blocked.length}`);

if (summary.needsState.length) console.table(summary.needsState.map(({ label, reason }) => ({ label, reason })));
if (summary.blocked.length) console.table(summary.blocked.map(({ label, reason, note }) => ({ label, reason, note })));

console.log('All legacy ingredient labels are now accounted for by the PUMP 3 migration classifier.');
