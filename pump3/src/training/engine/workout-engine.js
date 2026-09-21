import { EXERCISES, exerciseIsSafeForPrescription } from '../data/exercise-catalog.js';

const SLOT_PRIORITIES = Object.freeze({
  'full-body-a': ['legs','chest','back','core','shoulders','arms'],
  'full-body-b': ['back','legs','chest','core','arms','shoulders'],
  'full-body-c': ['chest','back','legs','core','shoulders','arms'],
  'full-body': ['legs','back','chest','core','shoulders','arms'],
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

function compatibleWithGroup(exercise, group) {
  if (exercise.group === group) return true;
  if (group === 'back' && exercise.group === 'posture') return true;
  return false;
}

function focusBonus(exercise, focus) {
  if (focus === 'upper' && ['chest','back','posture','shoulders','arms'].includes(exercise.group)) return 4;
  if (focus === 'lower' && exercise.group === 'legs') return 4;
  if (focus === 'core' && exercise.group === 'core') return 5;
  return 0;
}

function scoreExercise(exercise, { group, prescription, usage, sessionIds }) {
  let score = 100;
  if (exercise.group === group) score += 20;
  else if (group === 'back' && exercise.group === 'posture') score += 8;
  score += focusBonus(exercise, prescription.focus);
  score -= (usage.get(exercise.id) ?? 0) * 12;
  if (sessionIds.has(exercise.id)) score -= 1000;
  if (exercise.movementTags.includes('supported')) score += prescription.avoidMovementTags.length ? 3 : 0;
  if (exercise.movementTags.includes('back-friendly') && prescription.avoidMovementTags.includes('loaded-flexion')) score += 5;
  if (exercise.movementTags.includes('knee-friendly') && prescription.avoidMovementTags.includes('deep-knee-flexion')) score += 5;
  if (exercise.movementTags.includes('shoulder-friendly') && prescription.avoidMovementTags.includes('shoulder-demanding')) score += 5;
  return score;
}

function chooseExercise(group, candidates, context) {
  return candidates
    .filter((exercise) => compatibleWithGroup(exercise, group))
    .map((exercise) => ({ exercise, score: scoreExercise(exercise, { ...context, group }) }))
    .sort((a, b) => b.score - a.score || a.exercise.id.localeCompare(b.exercise.id))[0]?.exercise ?? null;
}

function prescriptionForExercise(exercise, prescription) {
  if (exercise.mode === 'seconds') {
    return Object.freeze({
      sets: prescription.defaultSets,
      mode: 'seconds',
      secondsRange: exercise.secondsRange,
      restSeconds: 45,
      effort: prescription.effort,
    });
  }
  return Object.freeze({
    sets: prescription.defaultSets,
    mode: 'reps',
    repRange: exercise.repRange ?? prescription.repRange,
    restSeconds: ['legs','chest','back'].includes(exercise.group) ? 75 : 60,
    effort: prescription.effort,
  });
}

export function eligibleExercises(prescription) {
  return EXERCISES.filter((exercise) => exerciseIsSafeForPrescription(exercise, prescription));
}

export function buildWorkoutPlan(prescription) {
  const candidates = eligibleExercises(prescription);
  if (candidates.length < 3) throw new Error('Not enough safe exercises for this training prescription');

  const usage = new Map();
  const sessions = prescription.split.map((slot, sessionIndex) => {
    const priorities = SLOT_PRIORITIES[slot] ?? SLOT_PRIORITIES['full-body'];
    const sessionIds = new Set();
    const selected = [];

    for (const group of priorities) {
      if (selected.length >= prescription.maxExercisesPerSession) break;
      const exercise = chooseExercise(group, candidates, { prescription, usage, sessionIds, sessionIndex });
      if (!exercise) continue;
      sessionIds.add(exercise.id);
      usage.set(exercise.id, (usage.get(exercise.id) ?? 0) + 1);
      selected.push(Object.freeze({
        exerciseId: exercise.id,
        group: exercise.group,
        names: exercise.names,
        prescription: prescriptionForExercise(exercise, prescription),
      }));
    }

    // Fill any remaining space with the safest least-used eligible exercises.
    if (selected.length < prescription.maxExercisesPerSession) {
      const fillers = [...candidates]
        .filter((exercise) => !sessionIds.has(exercise.id))
        .sort((a, b) => (usage.get(a.id) ?? 0) - (usage.get(b.id) ?? 0) || a.id.localeCompare(b.id));
      for (const exercise of fillers) {
        if (selected.length >= prescription.maxExercisesPerSession) break;
        sessionIds.add(exercise.id);
        usage.set(exercise.id, (usage.get(exercise.id) ?? 0) + 1);
        selected.push(Object.freeze({ exerciseId: exercise.id, group: exercise.group, names: exercise.names, prescription: prescriptionForExercise(exercise, prescription) }));
      }
    }

    return Object.freeze({
      id: slot,
      dayIndex: sessionIndex,
      durationMinutes: prescription.sessionMinutes,
      exercises: Object.freeze(selected),
    });
  });

  return Object.freeze({
    prescription,
    sessions: Object.freeze(sessions),
    exerciseUsage: Object.freeze(Object.fromEntries(usage)),
    audit: Object.freeze({
      eligibleExerciseIds: Object.freeze(candidates.map((exercise) => exercise.id)),
      excludedExerciseIds: Object.freeze(EXERCISES.filter((exercise) => !candidates.includes(exercise)).map((exercise) => exercise.id)),
    }),
  });
}

export { SLOT_PRIORITIES };
