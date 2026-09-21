import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EXERCISES, EXERCISE_BY_ID, alternativesForExercise, exerciseIsSafeForPrescription } from '../src/training/data/exercise-catalog.js';
import { buildWorkoutPlan, replaceExerciseInPlan } from '../src/training/engine/workout-engine.js';
import { mediaStatus, approvedMediaForExercise, mediaAudit } from '../src/training/media/media-registry.js';
import { createTrainingPrescription } from '../src/personalization/training-prescription.js';
import { buildPersonalizedPlan } from '../src/personalization/engine.js';

assert.ok(EXERCISES.length >= 45, `expected broad exercise coverage, got ${EXERCISES.length}`);
assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length, 'exercise IDs must be unique');
for (const e of EXERCISES) {
  assert.match(e.id, /^[a-z0-9-]+$/, `unstable exercise ID ${e.id}`);
  assert.ok(e.names.he && e.names.en, `bilingual names required for ${e.id}`);
  assert.ok(e.group && e.movementPattern, `group/pattern required for ${e.id}`);
  assert.ok(e.equipment.length > 0, `equipment required for ${e.id}`);
  assert.ok(e.muscles.length > 0, `muscles required for ${e.id}`);
}

const legacyManifest = JSON.parse(await readFile(new URL('../src/training/data/exercise-manifest.json', import.meta.url), 'utf8'));
for (const row of legacyManifest) assert.ok(EXERCISE_BY_ID[row.id], `legacy media ID must map to canonical exercise: ${row.id}`);

function prescription(overrides = {}) {
  return createTrainingPrescription({
    trainingDays: 3,
    sessionMinutes: 30,
    trainingFocus: 'balanced',
    trainingPlace: 'home',
    trainingLevel: 'beginner',
    equipment: ['bodyweight'],
    limitation: 'none',
    ...overrides,
  });
}

const bodyweight = prescription();
const bodyweightPlan = buildWorkoutPlan(bodyweight, { seed: 10, sex: 'female' });
assert.equal(bodyweightPlan.sessions.length, 3);
for (const session of bodyweightPlan.sessions) {
  assert.ok(session.exercises.length >= 3 && session.exercises.length <= bodyweight.maxExercisesPerSession);
  assert.equal(new Set(session.exercises.map((e) => e.exerciseId)).size, session.exercises.length, 'no duplicate exercise inside a session');
  for (const row of session.exercises) {
    const e = EXERCISE_BY_ID[row.exerciseId];
    assert.ok(e.exerciseIsSafe !== false);
    assert.ok(exerciseIsSafeForPrescription(e, bodyweight));
    assert.ok(row.alternatives.every((id) => EXERCISE_BY_ID[id]), 'alternatives are stable IDs');
  }
}

const knee = prescription({ equipment: ['dumbbells'], limitation: 'knee', trainingDays: 4, sessionMinutes: 45, trainingLevel: 'intermediate' });
const kneePlan = buildWorkoutPlan(knee, { seed: 22, sex: 'male' });
for (const session of kneePlan.sessions) for (const row of session.exercises) {
  const e = EXERCISE_BY_ID[row.exerciseId];
  assert.equal(e.movementTags.some((tag) => knee.avoidMovementTags.includes(tag)), false, `knee plan leaked ${e.id}`);
}

const shoulder = prescription({ equipment: ['dumbbells','bands'], limitation: 'shoulder', trainingDays: 4, trainingFocus: 'upper', trainingLevel: 'intermediate' });
const shoulderPlan = buildWorkoutPlan(shoulder, { seed: 31 });
for (const session of shoulderPlan.sessions) for (const row of session.exercises) {
  const e = EXERCISE_BY_ID[row.exerciseId];
  assert.equal(e.movementTags.some((tag) => shoulder.avoidMovementTags.includes(tag)), false, `shoulder plan leaked ${e.id}`);
}

const gym = prescription({ trainingPlace: 'gym', equipment: ['gym'], trainingDays: 5, sessionMinutes: 60, trainingLevel: 'advanced' });
const gymPlanA = buildWorkoutPlan(gym, { seed: 100, sex: 'male' });
const gymPlanB = buildWorkoutPlan(gym, { seed: 100, sex: 'male' });
assert.deepEqual(gymPlanA, gymPlanB, 'same prescription and seed must be deterministic');
assert.equal(gymPlanA.sessions.length, 5);
assert.ok(gymPlanA.sessions.every((s) => s.exercises.length <= gym.maxExercisesPerSession));

const firstExercise = gymPlanA.sessions[0].exercises.find((row) => row.alternatives.length);
assert.ok(firstExercise, 'at least one selected exercise needs a safe replacement');
const replacement = firstExercise.alternatives[0];
const replaced = replaceExerciseInPlan(gymPlanA, 0, firstExercise.exerciseId, replacement);
assert.ok(replaced.sessions[0].exercises.some((row) => row.exerciseId === replacement), 'replacement must use canonical ID');
assert.ok(alternativesForExercise(firstExercise.exerciseId, gym).some((e) => e.id === replacement));

assert.equal(mediaStatus('band-chest-press', 'female').quality, 'missing');
assert.equal(mediaStatus('seated-scapular-retraction', 'male').quality, 'replace');
assert.equal(approvedMediaForExercise('squat', 'female'), null, 'review assets must not silently become production-approved');
assert.ok(mediaAudit().every((row) => ['approved','review','replace','missing'].includes(row.quality)));

const personalizedInput = {
  id: 'training-contract-user', sex: 'male', age: 33, heightCm: 172, weightKg: 72, targetWeightKg: 76,
  goal: 'gain', activity: 'medium', diet: 'omnivore', trainingLevel: 'intermediate', trainingPlace: 'home', trainingDays: 4,
  personalization: { equipment: ['dumbbells','bands'], trainingFocus: 'upper', limitation: 'shoulder', sessionMinutes: 30 },
};
const p1 = buildPersonalizedPlan(personalizedInput, { dateKey: '2026-09-22' });
const p2 = buildPersonalizedPlan(personalizedInput, { dateKey: '2026-09-22' });
assert.deepEqual(p1.training.plan, p2.training.plan, 'personalized workout must be reproducible for same user/date');
assert.equal(p1.training.plan.sessions.length, 4);
assert.equal(p1.training.plan.seed, p1.audit.deterministicSeed);

console.log(`PUMP 3 section 4 training contract passed: ${EXERCISES.length} canonical exercises, deterministic safe selection, substitutions, and ID-based media quarantine.`);
