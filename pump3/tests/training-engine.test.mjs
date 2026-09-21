import assert from 'node:assert/strict';
import { EXERCISES, EXERCISE_BY_ID, exerciseIsSafeForPrescription } from '../src/training/data/exercise-catalog.js';
import { buildWorkoutPlan, eligibleExercises } from '../src/training/engine/workout-engine.js';
import { createTrainingPrescription } from '../src/personalization/training-prescription.js';
import { normalizePersonalizationProfile } from '../src/personalization/profile.js';
import { buildPersonalizedPlan } from '../src/personalization/engine.js';

assert.ok(EXERCISES.length >= 45, 'canonical catalog should provide broad home/gym/bodyweight coverage');
assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length, 'exercise IDs must be unique');
for (const exercise of EXERCISES) {
  assert.ok(exercise.names.he && exercise.names.en, `${exercise.id} needs localized names`);
  assert.ok(exercise.equipment.length >= 1, `${exercise.id} needs equipment metadata`);
  assert.ok(exercise.movementPattern, `${exercise.id} needs a movement pattern`);
  assert.ok(exercise.muscles.length >= 1, `${exercise.id} needs muscle metadata`);
}

function profile(overrides = {}) {
  return normalizePersonalizationProfile({
    id: 'training-test', sex: 'male', age: 33, heightCm: 172, weightKg: 70, targetWeightKg: 70,
    goal: 'maintain', activity: 'medium', trainingLevel: 'intermediate', trainingPlace: 'home', trainingDays: 4,
    personalization: { foodStyle: 'regular', equipment: ['dumbbells','bands'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
    ...overrides,
  });
}

const basePrescription = createTrainingPrescription(profile());
assert.ok(basePrescription.equipment.includes('bodyweight'), 'bodyweight must always be available');
const first = buildWorkoutPlan(basePrescription, { seed: 7 });
const second = buildWorkoutPlan(basePrescription, { seed: 7 });
assert.deepEqual(first, second, 'same prescription and seed must produce deterministic workouts');
assert.equal(first.sessions.length, 4);
for (const session of first.sessions) {
  assert.ok(session.exercises.length > 0);
  assert.ok(session.exercises.length <= basePrescription.maxExercisesPerSession);
  assert.equal(new Set(session.exercises.map((e) => e.exerciseId)).size, session.exercises.length, 'no duplicate exercise inside a session');
  for (const planned of session.exercises) {
    assert.ok(EXERCISE_BY_ID[planned.exerciseId]);
    assert.ok(exerciseIsSafeForPrescription(EXERCISE_BY_ID[planned.exerciseId], basePrescription));
    assert.ok(planned.prescription.sets >= 2);
  }
}

const kneePrescription = createTrainingPrescription(profile({
  trainingPlace: 'gym', trainingDays: 3,
  personalization: { foodStyle: 'regular', equipment: ['gym'], trainingFocus: 'lower', limitation: 'knee', sessionMinutes: 30 },
}));
const kneeEligible = eligibleExercises(kneePrescription).map((e) => e.id);
assert.equal(kneeEligible.includes('squat'), false);
assert.equal(kneeEligible.includes('leg-press'), false);
assert.equal(kneeEligible.includes('glute-bridge'), true);
const kneePlan = buildWorkoutPlan(kneePrescription);
for (const session of kneePlan.sessions) for (const planned of session.exercises) {
  const exercise = EXERCISE_BY_ID[planned.exerciseId];
  assert.equal(exercise.movementTags.some((tag) => kneePrescription.avoidMovementTags.includes(tag)), false, 'knee limitation leaked avoided movement');
}

const shoulderPrescription = createTrainingPrescription(profile({
  trainingDays: 3,
  personalization: { foodStyle: 'regular', equipment: ['dumbbells','bands'], trainingFocus: 'upper', limitation: 'shoulder', sessionMinutes: 30 },
}));
const shoulderEligible = eligibleExercises(shoulderPrescription).map((e) => e.id);
assert.equal(shoulderEligible.includes('bench-dips'), false);
assert.equal(shoulderEligible.includes('dumbbell-shoulder-press'), false);
assert.equal(shoulderEligible.includes('push-up'), false);
assert.equal(shoulderEligible.includes('wall-press'), true);
assert.equal(shoulderEligible.includes('dumbbell-floor-press'), true);

const bodyweightPrescription = createTrainingPrescription(profile({
  trainingLevel: 'beginner', trainingPlace: 'bodyweight', trainingDays: 2,
  personalization: { foodStyle: 'regular', equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 20 },
}));
const bodyweightPlan = buildWorkoutPlan(bodyweightPrescription);
assert.equal(bodyweightPlan.sessions.length, 2);
for (const session of bodyweightPlan.sessions) {
  assert.ok(session.exercises.length <= 4);
  for (const planned of session.exercises) assert.ok(EXERCISE_BY_ID[planned.exerciseId].equipment.includes('bodyweight'));
}

const integrated = buildPersonalizedPlan({
  id: 'integrated-training', sex: 'female', age: 30, heightCm: 165, weightKg: 60, targetWeightKg: 60,
  goal: 'maintain', activity: 'light', trainingLevel: 'beginner', trainingPlace: 'home', trainingDays: 3,
  personalization: { foodStyle: 'regular', equipment: ['bands'], trainingFocus: 'upper', limitation: 'shoulder', sessionMinutes: 30 },
}, { dateKey: '2026-09-21' });
assert.equal(integrated.training.plan.sessions.length, 3);
assert.ok(integrated.audit.trainingEligibleExercises.length > 0);
assert.ok(integrated.audit.trainingExcludedExercises.includes('dumbbell-shoulder-press'));
assert.equal(integrated.training.plan.seed, integrated.audit.deterministicSeed);

console.log('PUMP 3 training engine checks passed');
