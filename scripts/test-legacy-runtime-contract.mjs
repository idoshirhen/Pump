import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bundle = await readFile(new URL('../assets/index-personalized-v2.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

assert.ok(bundle.length > 400_000, 'main application bundle is present');
assert.match(bundle, /onboarding_done/, 'bundle still contains onboarding completion state');
assert.match(bundle, /user_personalization/, 'bundle still contains personalization persistence');
assert.match(bundle, /user_meal_feedback/, 'bundle still contains meal feedback persistence');
assert.match(bundle, /food_entries/, 'bundle still contains food logging');
assert.match(bundle, /workout_completions/, 'bundle still contains workout completion persistence');
assert.match(bundle, /needsMedicalClearance/, 'medical-clearance guard remains in bundle');
assert.match(bundle, /w\.age<18/, 'minor guard remains in bundle');
assert.match(bundle, /תזונה/, 'nutrition screen label remains available');
assert.match(bundle, /כושר/, 'training screen label remains available');
assert.match(bundle, /היום/, 'home screen label remains available');

assert.doesNotMatch(html, /pump-i18n-v1\.js/, 'the broken DOM translation layer is not loaded');
assert.match(html, /index-personalized-v2\.js/, 'current production application bundle is loaded');

console.log('legacy runtime contract checks passed');
