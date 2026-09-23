import { EXERCISE_BY_ID } from '../data/exercise-catalog.js';

// Legacy PUMP 2 WebPs were assembled from short AI frame sequences. They remain
// available only for internal review/reference. None are production-approved in
// PUMP 3 until replaced by a coherent source animation/video and explicitly
// promoted to APPROVED below.
const LEGACY_AVAILABLE = new Set([
  'squat','leg-press','glute-bridge','lateral-band-walk','push-up','incline-push-up','wall-press',
  'band-chest-press','dumbbell-floor-press','chest-press-machine','bench-dips','one-arm-dumbbell-row',
  'resistance-band-row','seated-cable-row','lat-pulldown','seated-scapular-retraction',
  'gentle-scapular-retraction','prone-ytw','dumbbell-shoulder-press','dumbbell-lateral-raise',
  'bodyweight-lateral-raise','dumbbell-biceps-curl','hammer-curl','overhead-triceps-extension','plank','dead-bug',
]);

const APPROVED = Object.freeze({});
const KNOWN_MISSING = Object.freeze({
  'band-chest-press': new Set(['female']),
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
  if (KNOWN_MISSING[exerciseId]?.has(normalizedSex)) return 'missing';
  if (!LEGACY_AVAILABLE.has(exerciseId)) return 'missing';
  if (APPROVED[exerciseId]?.includes(normalizedSex)) return 'approved';
  return 'replace';
}

export function getExerciseMedia(exerciseId, sex, { allowUnapproved = false } = {}) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;
  const normalizedSex = normalizeExerciseSex(sex);
  const quality = exerciseMediaQuality(exerciseId, normalizedSex);
  if (quality === 'missing') return null;
  if (!allowUnapproved && quality !== 'approved') return null;

  const folder = normalizedSex === 'male' ? 'male' : 'female';
  return Object.freeze({
    exerciseId,
    sex: normalizedSex,
    src: `/Pump/exercises/${folder}/${exerciseId}.webp`,
    quality,
    sourceKind: quality === 'approved' ? 'approved-production' : 'legacy-ai-frame-sequence',
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

export const MEDIA_POLICY = Object.freeze({
  productionRequires: 'approved',
  legacyDefault: 'replace',
  missingFallback: 'text-instructions',
  approvalRequirement: 'coherent-source-motion-reviewed-for-form-and-continuity',
});

export { LEGACY_AVAILABLE, APPROVED };
