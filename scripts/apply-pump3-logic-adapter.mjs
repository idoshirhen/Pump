import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../assets/index-personalized-v2.js', import.meta.url);
let source = await readFile(path, 'utf8');

const targetOld = /function pumpPersonalizedTargets\(e\)\{.*?\}function pumpWorkoutSets/;
const targetNew = 'function pumpPersonalizedTargets(e){return window.PUMP3CoreLogic?.targets?window.PUMP3CoreLogic.targets(e):ja(e)}function pumpWorkoutSets';

const trainingOld = /function pumpPersonalizedTraining\(e\)\{.*?\}\nfunction pumpIngredient/;
const trainingNew = 'function pumpPersonalizedTraining(e){let t=pumpPersonalization(e);return window.PUMP3CoreLogic?.training?window.PUMP3CoreLogic.training(e,t):Na(e)}\nfunction pumpIngredient';

let changed = false;
if (!source.includes(targetNew.slice(0, -'function pumpWorkoutSets'.length))) {
  if (!targetOld.test(source)) throw new Error('Could not locate pumpPersonalizedTargets in frozen bundle');
  source = source.replace(targetOld, targetNew);
  changed = true;
}
if (!source.includes(trainingNew.slice(0, -'\nfunction pumpIngredient'.length))) {
  if (!trainingOld.test(source)) throw new Error('Could not locate pumpPersonalizedTraining in frozen bundle');
  source = source.replace(trainingOld, trainingNew);
  changed = true;
}

if (changed) await writeFile(path, source, 'utf8');
console.log(changed ? 'Applied PUMP 3 logic adapter to frozen PUMP 2 bundle' : 'PUMP 3 logic adapter already applied');
