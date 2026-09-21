import assert from 'node:assert/strict';
import { EXERCISES } from '../src/training/data/exercise-catalog.js';
import { instructionForExercise, hasExerciseInstructions } from '../src/training/data/exercise-instructions.js';

for (const exercise of EXERCISES) {
  assert.equal(hasExerciseInstructions(exercise.id), true, `${exercise.id} is missing fallback instructions`);
  const instruction = instructionForExercise(exercise.id);
  assert.ok(instruction, `${exercise.id} must resolve instructions`);
  for (const lang of ['he','en']) {
    assert.ok(Array.isArray(instruction[lang]), `${exercise.id}/${lang} cues must be an array`);
    assert.ok(instruction[lang].length >= 2, `${exercise.id}/${lang} needs at least two cues`);
    for (const cue of instruction[lang]) {
      assert.ok(typeof cue === 'string' && cue.trim().length >= 12, `${exercise.id}/${lang} cue is too weak`);
    }
  }
}

assert.equal(instructionForExercise('not-real'), null);
console.log(`PUMP 3 instruction fallback checks passed for ${EXERCISES.length} exercises`);
