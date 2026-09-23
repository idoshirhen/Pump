import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const BASE = '23c255a36b420372af854e3b6146439db04f7f33';
const readCurrent = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readBase = (path) => execFileSync('git', ['show', `${BASE}:${path}`], { encoding: 'utf8' });

const visualFiles = [
  'assets/index-BKtf4AlF.css',
  'assets/pump-phase-one.css',
  'assets/pump-personalization-v21.css',
  'assets/pump-workout-timer-v1.css',
  'assets/pump-exercise-media-v1.css',
];
for (const path of visualFiles) assert.equal(await readCurrent(path), readBase(path), `${path} must remain byte-identical to the approved PUMP 2 UI`);

const binaryFiles = ['pump logo.png','pump-logo-black.png','pump-logo-favicon.png','pump-logo-heart-dumbbell.png'];
for (const path of binaryFiles) {
  const current = execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim();
  const base = execFileSync('git', ['rev-parse', `${BASE}:${path}`], { encoding: 'utf8' }).trim();
  assert.equal(current, base, `${path} must remain unchanged`);
}

const baseIndex = readBase('index.html');
const currentIndex = await readCurrent('index.html');
const styles = (html) => [...html.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g)].map((m) => m[1]);
assert.deepEqual(styles(currentIndex), styles(baseIndex), 'stylesheet order and URLs must stay identical');
assert.equal((currentIndex.match(/<body>[\s\S]*<\/body>/) || [])[0], (baseIndex.match(/<body>[\s\S]*<\/body>/) || [])[0], 'body/root markup must stay identical');
assert.ok(currentIndex.includes('/Pump/assets/pump3-core-logic-v1.js'), 'PUMP 3 core logic must load without introducing UI markup');

const targetOld = /function pumpPersonalizedTargets\(e\)\{.*?\}function pumpWorkoutSets/;
const trainingOld = /function pumpPersonalizedTraining\(e\)\{.*?\}\nfunction pumpIngredient/;
const targetNew = 'function pumpPersonalizedTargets(e){return window.PUMP3CoreLogic?.targets?window.PUMP3CoreLogic.targets(e):ja(e)}function pumpWorkoutSets';
const trainingNew = 'function pumpPersonalizedTraining(e){let t=pumpPersonalization(e);return window.PUMP3CoreLogic?.training?window.PUMP3CoreLogic.training(e,t):Na(e)}\nfunction pumpIngredient';
let expectedBundle = readBase('assets/index-personalized-v2.js');
assert.ok(targetOld.test(expectedBundle), 'baseline target function found');
expectedBundle = expectedBundle.replace(targetOld, targetNew);
assert.ok(trainingOld.test(expectedBundle), 'baseline training function found');
expectedBundle = expectedBundle.replace(trainingOld, trainingNew);
const currentBundle = await readCurrent('assets/index-personalized-v2.js');
assert.equal(currentBundle, expectedBundle, 'legacy React bundle may differ only at the two PUMP 3 logic delegation points');

console.log('Visual freeze passed: PUMP 2 UI is unchanged; only PUMP 3 logic delegation is allowed');
