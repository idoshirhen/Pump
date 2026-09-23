import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildPersonalizedPlan } from '../pump3/src/personalization/engine.js';

const BASELINE = '23c255a36b420372af854e3b6146439db04f7f33';
const index = fs.readFileSync('index.html', 'utf8');
const bridge = fs.readFileSync('assets/pump3-logic-bridge-v1.js', 'utf8');
const fetchBase = fs.readFileSync('assets/pump-fetch-base-v1.js', 'utf8');

// Visual contract: the legacy app remains the renderer and all legacy styles stay loaded.
assert.match(index, /assets\/index-personalized-v2\.js/);
assert.match(index, /assets\/index-BKtf4AlF\.css/);
assert.match(index, /assets\/pump-personalization-v21\.css/);
assert.match(index, /assets\/pump-workout-timer-v1\.css/);
assert.match(index, /assets\/pump-phase-one\.css/);
assert.match(index, /assets\/pump-exercise-media-v1\.css/);
assert.match(index, /pump-logo-favicon\.png/);
assert.doesNotMatch(index, /pump3\/src\/(?:main|App)\.jsx/);
assert.doesNotMatch(index, /pump3\/src\/styles\.css/);
assert.match(index, /pump-fetch-base-v1\.js/);
assert.match(index, /pump3-logic-bridge-v1\.js/);

// Fetch capture must load before the old nutrition wrapper; bridge must load after the old app bundle.
assert.ok(index.indexOf('pump-fetch-base-v1.js') < index.indexOf('pump-nutrition-accuracy-v1.js'));
assert.ok(index.indexOf('index-personalized-v2.js') < index.indexOf('pump3-logic-bridge-v1.js'));
assert.match(fetchBase, /__PUMP_NATIVE_FETCH/);

// Bridge may change data/text only, never layout/style or mount a replacement UI.
for (const forbidden of [
  '.style.', 'setAttribute("style"', "setAttribute('style'", 'createElement("style"', "createElement('style'",
  'document.getElementById("root").innerHTML', "document.getElementById('root').innerHTML",
  'createRoot(', 'ReactDOM', 'appendChild(', 'insertAdjacentHTML(',
]) {
  assert.equal(bridge.includes(forbidden), false, `logic bridge contains forbidden visual mutation: ${forbidden}`);
}
assert.match(bridge, /calculatePersonalizedTargets/);
assert.match(bridge, /targetMealNutrition/);
assert.match(bridge, /buildWorkoutPlan/);
assert.match(bridge, /user_meal_feedback/);
assert.match(bridge, /food_entries/);

// No existing visual/runtime baseline files are allowed to drift in this migration.
const frozen = [
  'assets/index-personalized-v2.js',
  'assets/index-BKtf4AlF.css',
  'assets/pump-personalization-v21.css',
  'assets/pump-workout-timer-v1.css',
  'assets/pump-phase-one.css',
  'assets/pump-exercise-media-v1.css',
  'pump-logo-main.png',
  'pump-logo-black.png',
  'pump-logo-favicon.png',
];
const changed = execFileSync('git', ['diff', '--name-only', BASELINE, '--', ...frozen], { encoding: 'utf8' }).trim();
assert.equal(changed, '', `visual baseline changed:\n${changed}`);

// Smoke-test the real PUMP 3 engines that the bridge imports.
const plan = buildPersonalizedPlan({
  id: 'logic-migration-smoke',
  sex: 'male',
  age: 33,
  height: 172,
  startWeight: 62,
  targetWeight: 65,
  goal: 'gain',
  activity: 'light',
  diet: 'omnivore',
  trainingLevel: 'intermediate',
  trainingPlace: 'home',
  trainingDays: 3,
  personalization: {
    foodStyle: 'omnivore',
    avoid: [],
    favorites: [],
    dislikes: [],
    equipment: ['bodyweight', 'dumbbells', 'bands'],
    trainingFocus: 'balanced',
    limitation: 'none',
    sessionMinutes: 30,
  },
  mealFeedback: [],
}, { dateKey: '2026-09-23' });

assert.ok(plan.targets.calories > 0);
assert.ok(plan.targets.protein > 0);
assert.equal(plan.nutrition.status, 'ready');
assert.equal(plan.nutrition.meals.length, 4);
assert.ok(plan.training.plan.sessions.length >= 2);
assert.ok(plan.training.plan.sessions.every((session) => session.exercises.length >= 3));

console.log('PUMP 3 logic-only migration contract passed: legacy UI frozen, new engines operational');
