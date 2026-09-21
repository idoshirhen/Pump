import { EXERCISE_BY_ID } from '../data/exercise-catalog.js';

// Only these legacy IDs have physical WebP files today. New canonical exercises
// are missing by default until a real asset is added and audited.
const LEGACY_AVAILABLE = new Set([
  'squat','leg-press','glute-bridge','lateral-band-walk','push-up','incline-push-up','wall-press',
  'band-chest-press','dumbbell-floor-press','chest-press-machine','bench-dips','one-arm-dumbbell-row',
  'resistance-band-row','seated-cable-row','lat-pulldown','seated-scapular-retraction',
  'gentle-scapular-retraction','prone-ytw','dumbbell-shoulder-press','dumbbell-lateral-raise',
  'bodyweight-lateral-raise','dumbbell-biceps-curl','hammer-curl','overhead-triceps-extension','plank','dead-bug',
]);

const QUALITY = Object.freeze({
  'band-chest-press': { female: 'missing', male: 'review' },
  'seated-scapular-retraction': { female: 'replace', male: 'replace' },
  'gentle-scapular-retraction': { female: 'replace', male: 'replace' },
});

export function normalizeExerciseSex(value) {
  return value === 'male' ? 'male' : 'female';
}

export function getExerciseById(exerciseId) {
  return EXERCISE_BY_ID[exerciseId] ?? null;
}

export function exerciseMediaQuality(exerciseId, sex) {
  if (!getExerciseById(exerciseId) || !LEGACY_AVAILABLE.has(exerciseId)) return 'missing';
  const normalizedSex = normalizeExerciseSex(sex);
  return QUALITY[exerciseId]?.[normalizedSex] ?? 'review';
}

export function getExerciseMedia(exerciseId, sex, { allowUnapproved = false } = {}) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;
  const normalizedSex = normalizeExerciseSex(sex);
  const quality = exerciseMediaQuality(exerciseId, normalizedSex);
  if (quality === 'missing') return null;
  if (!allowUnapproved && quality !== 'approved') return null;

  const folder = normalizedSex === 'male' ? 'exercises-male' : 'exercises';
  return Object.freeze({
    exerciseId,
    sex: normalizedSex,
    src: `/Pump/assets/${folder}/${exerciseId}.webp`,
    quality,
    altHe: `${exercise.names.he} – הדגמת תנועה`,
    altEn: `${exercise.names.en} – movement demo`,
  });
}

export function hasApprovedExerciseMedia(exerciseId, sex) {
  return exerciseMediaQuality(exerciseId, sex) === 'approved';
}

export function getExerciseMediaAudit() {
  return Object.freeze(Object.keys(EXERCISE_BY_ID).map((exerciseId) => Object.freeze({
    exerciseId,
    female: exerciseMediaQuality(exerciseId, 'female'),
    male: exerciseMediaQuality(exerciseId, 'male'),
  })));
}

export { LEGACY_AVAILABLE };
