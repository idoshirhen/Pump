// Exercise media is addressed only by stable exercise ID. Display text is never
// used as a lookup key. Legacy assets are quarantined until explicitly approved.
const LEGACY_MEDIA = Object.freeze({
  squat: { female: 'review', male: 'review' },
  'leg-press': { female: 'review', male: 'review' },
  'glute-bridge': { female: 'review', male: 'review' },
  'lateral-band-walk': { female: 'review', male: 'review' },
  'push-up': { female: 'review', male: 'review' },
  'incline-push-up': { female: 'review', male: 'review' },
  'wall-press': { female: 'review', male: 'review' },
  'band-chest-press': { female: 'missing', male: 'review' },
  'dumbbell-floor-press': { female: 'review', male: 'review' },
  'chest-press-machine': { female: 'review', male: 'review' },
  'bench-dips': { female: 'review', male: 'review' },
  'one-arm-dumbbell-row': { female: 'review', male: 'review' },
  'resistance-band-row': { female: 'review', male: 'review' },
  'seated-cable-row': { female: 'review', male: 'review' },
  'lat-pulldown': { female: 'review', male: 'review' },
  'seated-scapular-retraction': { female: 'replace', male: 'replace' },
  'gentle-scapular-retraction': { female: 'replace', male: 'replace' },
  'prone-ytw': { female: 'review', male: 'review' },
  'dumbbell-shoulder-press': { female: 'review', male: 'review' },
  'dumbbell-lateral-raise': { female: 'review', male: 'review' },
  'bodyweight-lateral-raise': { female: 'review', male: 'review' },
  'dumbbell-biceps-curl': { female: 'review', male: 'review' },
  'hammer-curl': { female: 'review', male: 'review' },
  'overhead-triceps-extension': { female: 'review', male: 'review' },
  plank: { female: 'review', male: 'review' },
  'dead-bug': { female: 'review', male: 'review' },
});

function legacyPath(exerciseId, sex) {
  const folder = sex === 'male' ? 'exercises-male' : 'exercises';
  return `/Pump/assets/${folder}/${exerciseId}.webp`;
}

export function mediaStatus(exerciseId, sex = 'female') {
  const quality = LEGACY_MEDIA[exerciseId]?.[sex] ?? 'missing';
  return Object.freeze({
    exerciseId,
    sex,
    quality,
    available: quality !== 'missing',
    approved: quality === 'approved',
    path: quality === 'missing' ? null : legacyPath(exerciseId, sex),
  });
}

export function approvedMediaForExercise(exerciseId, sex = 'female') {
  const status = mediaStatus(exerciseId, sex);
  return status.approved ? status : null;
}

export function mediaAudit() {
  const rows = [];
  for (const [exerciseId, sexes] of Object.entries(LEGACY_MEDIA)) {
    for (const sex of ['female', 'male']) rows.push(mediaStatus(exerciseId, sex));
  }
  return Object.freeze(rows);
}

export { LEGACY_MEDIA };
