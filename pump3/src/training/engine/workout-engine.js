import { EXERCISES, EXERCISE_BY_ID, alternativesForExercise, exerciseIsSafeForPrescription } from '../data/exercise-catalog.js';
import { exerciseMediaQuality, getExerciseMedia, normalizeExerciseSex } from '../media/exerciseMedia.js';

const SLOT_PRIORITIES = Object.freeze({
  'full-body-a': ['legs','chest','back','core','shoulders'],
  'full-body-b': ['back','legs','chest','core','arms'],
  'full-body-c': ['chest','back','legs','core','posture'],
  'full-body': ['legs','back','chest','core','shoulders'],
  'upper-a': ['chest','back','shoulders','arms','core'],
  'upper-b': ['back','chest','arms','shoulders','core'],
  'upper-maintenance': ['back','chest','shoulders','arms','core'],
  'upper-maintenance-a': ['chest','back','core','arms','shoulders'],
  'upper-maintenance-b': ['back','chest','core','shoulders','arms'],
  'lower-a': ['legs','legs','core','posture'],
  'lower-b': ['legs','core','legs','posture'],
  'lower-maintenance': ['legs','core','posture'],
  'lower-maintenance-a': ['legs','core','posture'],
  'lower-maintenance-b': ['core','legs','posture'],
});

function stableRank(id, seed) {
  let hash = (2166136261 ^ Number(seed || 0)) >>> 0;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function compatibleWithGroup(exercise, group) {
  if (exercise.group === group) return true;
  return group === 'back' && exercise.group === 'posture';
}

function focusBonus(exercise, focus) {
  if (focus === 'upper' && ['chest','back','posture','shoulders','arms'].includes(exercise.group)) return 4;
  if (focus === 'lower' && exercise.group === 'legs') return 4;
  if (focus === 'core' && exercise.group === 'core') return 5;
  return 0;
}

function scoreExercise(exercise, { group, prescription, usage, sessionIds, patterns, seed }) {
  let score = 100;
  if (exercise.group === group) score += 20;
  else if (group === 'back' && exercise.group === 'posture') score += 8;
  score += focusBonus(exercise, prescription.focus);
  score -= (usage.get(exercise.id) ?? 0) * 14;
  if (sessionIds.has(exercise.id)) score -= 1000;
  if (patterns.has(exercise.movementPattern)) score -= 9;
  if (exercise.movementTags.includes('supported') && prescription.avoidMovementTags.length) score += 4;
  if (exercise.movementTags.includes('back-friendly') && prescription.avoidMovementTags.includes('loaded-flexion')) score += 6;
  if (exercise.movementTags.includes('knee-friendly') && prescription.avoidMovementTags.includes('deep-knee-flexion')) score += 6;
  if (exercise.movementTags.includes('shoulder-friendly') && prescription.avoidMovementTags.includes('shoulder-demanding')) score += 6;
  return { score, rank: stableRank(exercise.id, seed) };
}

function chooseExercise(group, candidates, context) {
  return candidates
    .filter((exercise) => compatibleWithGroup(exercise, group))
    .map((exercise) => ({ exercise, ...scoreExercise(exercise, { ...context, group }) }))
    .sort((a, b) => b.score - a.score || a.rank - b.rank || a.exercise.id.localeCompare(b.exercise.id))[0]?.exercise ?? null;
}

function prescriptionForExercise(exercise, prescription) {
  if (exercise.mode === 'seconds') {
    return Object.freeze({ sets: prescription.defaultSets, mode: 'seconds', secondsRange: exercise.secondsRange, restSeconds: 45, effort: prescription.effort });
  }
  return Object.freeze({
    sets: prescription.defaultSets,
    mode: 'reps',
    repRange: exercise.repRange ?? prescription.repRange,
    restSeconds: ['legs','chest','back'].includes(exercise.group) ? 75 : 60,
    effort: prescription.effort,
  });
}

function workoutExercise(exercise, prescription, sex) {
  const normalizedSex = normalizeExerciseSex(sex);
  const mediaQuality = exerciseMediaQuality(exercise.id, normalizedSex);
  return Object.freeze({
    exerciseId: exercise.id,
    group: exercise.group,
    movementPattern: exercise.movementPattern,
    names: exercise.names,
    prescription: prescriptionForExercise(exercise, prescription),
    alternatives: Object.freeze(alternativesForExercise(exercise.id, prescription).slice(0, 4).map((entry) => entry.id)),
    media: Object.freeze({
      sex: normalizedSex,
      quality: mediaQuality,
      approvedAsset: getExerciseMedia(exercise.id, normalizedSex),
    }),
  });
}

export function eligibleExercises(prescription) {
  return EXERCISES.filter((exercise) => exerciseIsSafeForPrescription(exercise, prescription));
}

export function buildWorkoutPlan(prescription, { seed = 0, sex = 'female' } = {}) {
  const candidates = eligibleExercises(prescription);
  if (candidates.length < 3) throw new Error('Not enough safe exercises for this training prescription');

  const usage = new Map();
  const sessions = prescription.split.map((slot, sessionIndex) => {
    const priorities = SLOT_PRIORITIES[slot] ?? SLOT_PRIORITIES['full-body'];
    const sessionIds = new Set();
    const patterns = new Set();
    const selected = [];

    for (const group of priorities) {
      if (selected.length >= prescription.maxExercisesPerSession) break;
      const exercise = chooseExercise(group, candidates, { prescription, usage, sessionIds, patterns, seed: seed + sessionIndex * 101 });
      if (!exercise) continue;
      sessionIds.add(exercise.id);
      patterns.add(exercise.movementPattern);
      usage.set(exercise.id, (usage.get(exercise.id) ?? 0) + 1);
      selected.push(workoutExercise(exercise, prescription, sex));
    }

    if (selected.length < prescription.maxExercisesPerSession) {
      const fillers = [...candidates]
        .filter((exercise) => !sessionIds.has(exercise.id))
        .sort((a, b) => (usage.get(a.id) ?? 0) - (usage.get(b.id) ?? 0) || stableRank(a.id, seed + sessionIndex) - stableRank(b.id, seed + sessionIndex));
      for (const exercise of fillers) {
        if (selected.length >= prescription.maxExercisesPerSession) break;
        sessionIds.add(exercise.id);
        patterns.add(exercise.movementPattern);
        usage.set(exercise.id, (usage.get(exercise.id) ?? 0) + 1);
        selected.push(workoutExercise(exercise, prescription, sex));
      }
    }

    if (selected.length < Math.min(3, prescription.maxExercisesPerSession)) throw new Error(`Not enough safe exercise coverage for session ${slot}`);
    return Object.freeze({ id: slot, dayIndex: sessionIndex, durationMinutes: prescription.sessionMinutes, exercises: Object.freeze(selected) });
  });

  return Object.freeze({
    prescription,
    seed,
    sessions: Object.freeze(sessions),
    exerciseUsage: Object.freeze(Object.fromEntries(usage)),
    audit: Object.freeze({
      eligibleExerciseIds: Object.freeze(candidates.map((exercise) => exercise.id)),
      excludedExerciseIds: Object.freeze(EXERCISES.filter((exercise) => !candidates.includes(exercise)).map((exercise) => exercise.id)),
    }),
  });
}

export function replaceExerciseInPlan(plan, sessionIndex, exerciseId, replacementId) {
  const original = EXERCISE_BY_ID[exerciseId];
  const replacement = EXERCISE_BY_ID[replacementId];
  if (!original || !replacement) throw new Error('Unknown exercise replacement');
  const allowed = alternativesForExercise(exerciseId, plan.prescription).some((entry) => entry.id === replacementId);
  if (!allowed) throw new Error(`Unsafe or incompatible replacement ${replacementId} for ${exerciseId}`);
  const sessions = plan.sessions.map((session, index) => index !== sessionIndex ? session : Object.freeze({
    ...session,
    exercises: Object.freeze(session.exercises.map((entry) => entry.exerciseId === exerciseId
      ? workoutExercise(replacement, plan.prescription, entry.media?.sex ?? 'female')
      : entry)),
  }));
  return Object.freeze({ ...plan, sessions: Object.freeze(sessions) });
}

export { SLOT_PRIORITIES, stableRank };
