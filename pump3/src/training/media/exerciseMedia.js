import manifest from '../data/exercise-manifest.json';

const byId = new Map(manifest.map((exercise) => [exercise.id, exercise]));

export function normalizeExerciseSex(value) {
  return value === 'male' ? 'male' : 'female';
}

export function getExerciseById(exerciseId) {
  return byId.get(exerciseId) ?? null;
}

export function getExerciseMedia(exerciseId, sex) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;

  const normalizedSex = normalizeExerciseSex(sex);
  const variant = exercise.media?.[normalizedSex];
  if (!variant?.available) return null;

  return {
    exerciseId,
    sex: normalizedSex,
    src: `/exercises/${normalizedSex}/${exerciseId}.webp`,
    quality: variant.quality ?? 'review',
    altHe: `${exercise.he} – הדגמת תנועה`,
    altEn: `${exercise.en} – movement demo`,
  };
}

export function hasApprovedExerciseMedia(exerciseId, sex) {
  const media = getExerciseMedia(exerciseId, sex);
  return Boolean(media && media.quality === 'approved');
}
