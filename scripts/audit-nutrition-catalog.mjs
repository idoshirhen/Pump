import { readFile } from 'node:fs/promises';

const source = await readFile('scripts/pump-catalog-helpers.js', 'utf8');
const ingredientPattern = /pumpIngredient\('([^']+)'/g;
const ingredients = [...source.matchAll(ingredientPattern)].map((match) => match[1]);
const unique = [...new Set(ingredients)].sort((a, b) => a.localeCompare(b, 'he'));

const ambiguousRules = [
  { re: /^חומוס$/i, reason: 'ambiguous: hummus spread vs cooked chickpeas' },
  { re: /^ירקות$/i, reason: 'generic food group, not a canonical nutrition item' },
  { re: /^פרי טרי$/i, reason: 'generic food group, nutrition varies materially by fruit' },
  { re: /^אגוזים$/i, reason: 'generic food group, nutrition varies by nut type' },
  { re: /^דג לבן$/i, reason: 'generic fish category; species/preparation required' },
  { re: /^גבינה 5%$/i, reason: 'generic cheese label; product/type required' },
  { re: /^תחליף עוף/i, reason: 'processed product values vary by manufacturer' },
  { re: /פרגיות או חזה עוף/i, reason: 'two foods with different nutrition in one ingredient label' },
  { re: /ענבים או פרי/i, reason: 'alternative foods share one nutrition line' },
];

const ambiguous = [];
for (const name of unique) {
  const rule = ambiguousRules.find((item) => item.re.test(name));
  if (rule) ambiguous.push({ ingredient: name, reason: rule.reason });
}

const stateSensitive = unique.filter((name) =>
  /אורז|פסטה|פתיתים|קוסקוס|בורגול|קינואה|עדשים|שעועית|חומוס|תפוחי? אדמה|בטטה|עוף|בקר|דג|סלמון|טופו/i.test(name)
  && !/מבושל|מבושלת|מבושלים|אפוי|אפויה|אפויים|בתנור|צרוב|מסוננת|מוכן|מתובל|טחון|קשות|קשה/i.test(name)
);

console.log(`PUMP 2 catalog ingredient references: ${ingredients.length}`);
console.log(`Unique ingredient labels: ${unique.length}`);
console.log(`Ambiguous labels requiring canonicalization: ${ambiguous.length}`);
if (ambiguous.length) console.table(ambiguous);
console.log(`State-sensitive labels without an explicit preparation/state marker: ${stateSensitive.length}`);
if (stateSensitive.length) console.table(stateSensitive.map((ingredient) => ({ ingredient })));

if (!ingredients.length) {
  console.error('Nutrition catalog audit could not find any pumpIngredient() entries.');
  process.exitCode = 1;
}
