const LIMITATION_RULES = Object.freeze({
  none: { avoidMovementTags: [], note: null },
  knee: { avoidMovementTags: ['deep-knee-flexion', 'impact', 'jumping'], note: 'Prefer pain-free range and lower-impact lower-body work.' },
  shoulder: { avoidMovementTags: ['overhead-heavy', 'deep-dip', 'shoulder-demanding'], note: 'Prefer pain-free pressing angles and controlled scapular work.' },
  back: { avoidMovementTags: ['heavy-spinal-loading', 'loaded-flexion'], note: 'Prefer supported variations and neutral-spine control.' },
});

const LEVEL_RULES = Object.freeze({
  beginner: { defaultSets: 2, repRange: [8, 12], effort: 'leave-3-reps-in-reserve' },
  intermediate: { defaultSets: 3, repRange: [8, 15], effort: 'leave-2-reps-in-reserve' },
  advanced: { defaultSets: 3, repRange: [6, 15], effort: 'leave-1-to-2-reps-in-reserve' },
});

function splitFor(days, focus) {
  if (days <= 2) return ['full-body-a', 'full-body-b'];
  if (days === 3) {
    if (focus === 'upper') return ['upper-a', 'lower-maintenance', 'upper-b'];
    if (focus === 'lower') return ['lower-a', 'upper-maintenance', 'lower-b'];
    return ['full-body-a', 'full-body-b', 'full-body-c'];
  }
  if (days === 4) return focus === 'upper'
    ? ['upper-a', 'lower-maintenance-a', 'upper-b', 'lower-maintenance-b']
    : focus === 'lower'
      ? ['lower-a', 'upper-maintenance-a', 'lower-b', 'upper-maintenance-b']
      : ['upper-a', 'lower-a', 'upper-b', 'lower-b'];
  if (days === 5) return ['upper-a', 'lower-a', 'full-body', 'upper-b', 'lower-b'];
  return ['upper-a', 'lower-a', 'full-body-a', 'upper-b', 'lower-b', 'full-body-b'];
}

function maxExercisesFor(minutes) {
  if (minutes <= 20) return 4;
  if (minutes <= 30) return 5;
  if (minutes <= 45) return 6;
  return 7;
}

export function createTrainingPrescription(profile) {
  const limitation = LIMITATION_RULES[profile.limitation];
  const level = LEVEL_RULES[profile.trainingLevel];
  const equipment = new Set(profile.equipment);
  // Bodyweight is always available in every environment; gym equipment is only
  // added for gym users. This prevents a home user with dumbbells from losing
  // push-ups/core work simply because the onboarding array omitted bodyweight.
  equipment.add('bodyweight');
  if (profile.trainingPlace === 'gym') equipment.add('gym');

  return Object.freeze({
    daysPerWeek: profile.trainingDays,
    sessionMinutes: profile.sessionMinutes,
    split: Object.freeze(splitFor(profile.trainingDays, profile.trainingFocus)),
    focus: profile.trainingFocus,
    place: profile.trainingPlace,
    level: profile.trainingLevel,
    equipment: Object.freeze([...equipment]),
    maxExercisesPerSession: maxExercisesFor(profile.sessionMinutes),
    defaultSets: level.defaultSets,
    repRange: Object.freeze(level.repRange),
    effort: level.effort,
    avoidMovementTags: Object.freeze([...limitation.avoidMovementTags]),
    limitationNote: limitation.note,
    audit: Object.freeze([
      `${profile.trainingDays} training days/week => ${splitFor(profile.trainingDays, profile.trainingFocus).join(', ')}`,
      `${profile.sessionMinutes} minute sessions => max ${maxExercisesFor(profile.sessionMinutes)} exercises/session`,
      `${profile.trainingLevel} => ${level.defaultSets} default sets, ${level.repRange[0]}-${level.repRange[1]} reps`,
      `Equipment: ${[...equipment].join(', ')}`,
      `Limitation: ${profile.limitation}`,
    ]),
  });
}

export { LIMITATION_RULES, LEVEL_RULES };
