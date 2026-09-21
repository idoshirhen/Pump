import { EXERCISE_BY_ID } from '../data/exercise-catalog.js';

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
  if (!getExerciseById(exerciseId)) return 'missing';
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
