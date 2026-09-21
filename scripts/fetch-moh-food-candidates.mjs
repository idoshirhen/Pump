import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { summarizeLegacyFoodLabels } from '../pump3/src/nutrition/migration/legacy-food-classifier.js';

const RESOURCE_ID = 'c3cb0630-0650-46c1-a068-82d575c094b2';
const API = 'https://data.gov.il/api/3/action/datastore_search';

function normalize(value) {
  return String(value ?? '')
    .trim()
    .replace(/[״”]/g, '"')
    .replace(/[׳’]/g, "'")
    .replace(/[,:;()\-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('he');
}

function tokens(value) {
  return new Set(normalize(value).split(' ').filter((token) => token.length > 1));
}

function scoreCandidate(label, row) {
  const target = normalize(label);
  const he = normalize(row.shmmitzrach);
  const en = normalize(row.english_name);
  if (!he) return 0;
  if (he === target) return 100;
  if (he.startsWith(target) || target.startsWith(he)) return 92;
  if (he.includes(target) || target.includes(he)) return 86;

  const targetTokens = tokens(target);
  const rowTokens = tokens(`${he} ${en}`);
  let overlap = 0;
  for (const token of targetTokens) if (rowTokens.has(token)) overlap += 1;
  return targetTokens.size ? Math.round((overlap / targetTokens.size) * 75) : 0;
}

async function fetchJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

async function search(label) {
  const url = new URL(API);
  url.searchParams.set('resource_id', RESOURCE_ID);
  url.searchParams.set('limit', '25');
  url.searchParams.set('q', label);
  const data = await fetchJson(url);
  if (!data?.success || !Array.isArray(data?.result?.records)) {
    throw new Error(`Unexpected MOH response for ${label}`);
  }
  return data.result.records
    .map((row) => ({
      score: scoreCandidate(label, row),
      row: {
        Code: row.Code ?? row.code,
        shmmitzrach: row.shmmitzrach,
        english_name: row.english_name,
        protein: row.protein,
        total_fat: row.total_fat,
        carbohydrates: row.carbohydrates,
        food_energy: row.food_energy,
        tarich_idkun: row.tarich_idkun,
      },
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function compactCandidate(best) {
  if (!best) return 'NO MATCH';
  const row = best.row;
  return `${row.shmmitzrach} [code=${row.Code}; kcal=${row.food_energy}; P=${row.protein}; C=${row.carbohydrates}; F=${row.total_fat}]`;
}

const source = await readFile('scripts/pump-catalog-helpers.js', 'utf8');
const labels = [...source.matchAll(/pumpIngredient\('([^']+)'/g)].map((match) => match[1]);
const summary = summarizeLegacyFoodLabels(labels);
const readyLabels = summary.ready.map((item) => item.label);

await mkdir('pump3/audit', { recursive: true });
const matches = [];
for (const [index, label] of readyLabels.entries()) {
  const candidates = await search(label);
  const best = candidates[0] ?? null;
  matches.push({
    label,
    status: best?.score === 100 ? 'exact' : best?.score >= 86 ? 'strong-candidate' : best ? 'review' : 'not-found',
    bestScore: best?.score ?? 0,
    candidates,
  });
  console.log(`[${index + 1}/${readyLabels.length}] ${label} -> ${compactCandidate(best)} (${best?.score ?? 0})`);
}

const exact = matches.filter((item) => item.status === 'exact');
const strong = matches.filter((item) => item.status === 'strong-candidate');
const review = matches.filter((item) => item.status === 'review' || item.status === 'not-found');
const report = {
  generatedAt: new Date().toISOString(),
  source: { resourceId: RESOURCE_ID, api: API },
  counts: { ready: readyLabels.length, exact: exact.length, strong: strong.length, review: review.length },
  matches,
};

await writeFile('pump3/audit/moh-food-candidates.json', JSON.stringify(report, null, 2));
await writeFile('pump3/audit/moh-food-exact-matches.json', JSON.stringify(exact, null, 2));
console.log(`Official MOH matching complete: ${exact.length} exact, ${strong.length} strong, ${review.length} review.`);
