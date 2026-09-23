function exercise(id, he, en, group, equipment, movementPattern, movementTags, {
  level = 'beginner', mode = 'reps', repRange = null, secondsRange = null,
  muscles = [], aliases = [], unilateral = false,
} = {}) {
  return Object.freeze({
    id,
    names: Object.freeze({ he, en }),
    group,
    equipment: Object.freeze([...equipment]),
    movementPattern,
    movementTags: Object.freeze([...movementTags]),
    level,
    mode,
    repRange: repRange ? Object.freeze([...repRange]) : null,
    secondsRange: secondsRange ? Object.freeze([...secondsRange]) : null,
    muscles: Object.freeze([...muscles]),
    aliases: Object.freeze([...aliases]),
    unilateral,
  });
}

export const EXERCISES = Object.freeze([
  exercise('squat','סקוואט','Squat','legs',['bodyweight','dumbbells','gym'],'squat',['deep-knee-flexion'],{muscles:['quads','glutes']}),
  exercise('box-squat','סקוואט לקופסה','Box Squat','legs',['bodyweight','dumbbells','gym'],'squat',['controlled-knee-flexion'],{muscles:['quads','glutes']}),
  exercise('leg-press','לחיצת רגליים','Leg Press','legs',['gym'],'squat',['deep-knee-flexion','supported'],{muscles:['quads','glutes']}),
  exercise('glute-bridge','גשר ישבן','Glute Bridge','legs',['bodyweight','dumbbells','gym'],'hip-extension',['back-friendly','knee-friendly'],{muscles:['glutes','hamstrings']}),
  exercise('hip-thrust','היפ תראסט','Hip Thrust','legs',['dumbbells','gym'],'hip-extension',['knee-friendly'],{level:'intermediate',muscles:['glutes','hamstrings']}),
  exercise('lateral-band-walk','הליכת צד עם גומייה','Lateral Band Walk','legs',['bands'],'hip-abduction',['knee-friendly'],{muscles:['glute-medius']}),
  exercise('standing-band-leg-curl','כפיפת ברך עם גומייה','Standing Band Leg Curl','legs',['bands'],'knee-flexion',['knee-friendly'],{muscles:['hamstrings']}),
  exercise('calf-raise','עליות תאומים','Calf Raise','legs',['bodyweight','dumbbells','gym'],'calf-raise',['low-impact'],{muscles:['calves']}),
  exercise('step-up','עלייה למדרגה','Step-Up','legs',['bodyweight','dumbbells','gym'],'single-leg',['knee-demanding'],{level:'intermediate',unilateral:true,muscles:['quads','glutes']}),

  exercise('push-up','שכיבות סמיכה','Push-Up','chest',['bodyweight'],'horizontal-press',['shoulder-demanding'],{muscles:['chest','triceps','shoulders']}),
  exercise('incline-push-up','שכיבות סמיכה בשיפוע','Incline Push-Up','chest',['bodyweight'],'horizontal-press',['shoulder-moderate'],{muscles:['chest','triceps']}),
  exercise('wall-press','לחיצה מול קיר','Wall Press','chest',['bodyweight'],'horizontal-press',['shoulder-friendly'],{muscles:['chest','triceps']}),
  exercise('band-chest-press','לחיצת חזה עם גומייה','Band Chest Press','chest',['bands'],'horizontal-press',['controlled'],{muscles:['chest','triceps']}),
  exercise('dumbbell-floor-press','לחיצת חזה עם משקולות בשכיבה','Dumbbell Floor Press','chest',['dumbbells'],'horizontal-press',['shoulder-friendly'],{muscles:['chest','triceps']}),
  exercise('dumbbell-bench-press','לחיצת חזה עם משקולות','Dumbbell Bench Press','chest',['gym'],'horizontal-press',['shoulder-moderate'],{level:'intermediate',muscles:['chest','triceps']}),
  exercise('chest-press-machine','לחיצת חזה במכונה','Chest Press Machine','chest',['gym'],'horizontal-press',['supported'],{muscles:['chest','triceps']}),
  exercise('cable-chest-fly','פרפר בכבל','Cable Chest Fly','chest',['gym'],'chest-adduction',['shoulder-moderate'],{level:'intermediate',muscles:['chest']}),

  exercise('one-arm-dumbbell-row','חתירה ביד אחת','One-Arm Dumbbell Row','back',['dumbbells'],'horizontal-pull',['supported'],{unilateral:true,muscles:['lats','upper-back','biceps']}),
  exercise('resistance-band-row','חתירה עם גומייה','Resistance Band Row','back',['bands'],'horizontal-pull',['back-friendly'],{muscles:['upper-back','lats','biceps']}),
  exercise('seated-cable-row','חתירה בכבל','Seated Cable Row','back',['gym'],'horizontal-pull',['supported'],{muscles:['upper-back','lats','biceps']}),
  exercise('chest-supported-row','חתירה עם תמיכת חזה','Chest-Supported Row','back',['gym'],'horizontal-pull',['supported','back-friendly'],{muscles:['upper-back','lats','biceps']}),
  exercise('lat-pulldown','פולי עליון','Lat Pulldown','back',['gym'],'vertical-pull',['controlled'],{muscles:['lats','biceps']}),
  exercise('band-lat-pulldown','משיכת גומייה מלמעלה','Band Lat Pulldown','back',['bands'],'vertical-pull',['back-friendly'],{muscles:['lats','biceps']}),
  exercise('dumbbell-pullover','פולאובר עם משקולת','Dumbbell Pullover','back',['dumbbells'],'vertical-pull',['shoulder-moderate'],{level:'intermediate',muscles:['lats','chest']}),

  exercise('seated-scapular-retraction','קירוב שכמות בישיבה','Seated Scapular Retraction','posture',['bodyweight'],'scapular-control',['shoulder-friendly','back-friendly'],{muscles:['mid-traps','rhomboids']}),
  exercise('gentle-scapular-retraction','קירוב שכמות עדין','Gentle Scapular Retraction','posture',['bodyweight'],'scapular-control',['shoulder-friendly','back-friendly','low-load'],{muscles:['mid-traps','rhomboids']}),
  exercise('prone-ytw','Y-T-W בשכיבה','Prone Y-T-W','posture',['bodyweight'],'scapular-control',['shoulder-moderate'],{muscles:['rear-delts','mid-traps']}),
  exercise('band-face-pull','פייס פול עם גומייה','Band Face Pull','posture',['bands'],'scapular-control',['shoulder-friendly'],{muscles:['rear-delts','mid-traps']}),
  exercise('cable-face-pull','פייס פול בכבל','Cable Face Pull','posture',['gym'],'scapular-control',['shoulder-friendly','supported'],{muscles:['rear-delts','mid-traps']}),

  exercise('dumbbell-shoulder-press','לחיצת כתפיים','Dumbbell Shoulder Press','shoulders',['dumbbells','gym'],'vertical-press',['overhead-heavy'],{muscles:['shoulders','triceps']}),
  exercise('machine-shoulder-press','לחיצת כתפיים במכונה','Machine Shoulder Press','shoulders',['gym'],'vertical-press',['overhead-heavy','supported'],{muscles:['shoulders','triceps']}),
  exercise('dumbbell-lateral-raise','הרחקות לצדדים','Lateral Raise','shoulders',['dumbbells','gym'],'shoulder-abduction',['controlled'],{muscles:['side-delts']}),
  exercise('band-lateral-raise','הרחקות לצדדים עם גומייה','Band Lateral Raise','shoulders',['bands'],'shoulder-abduction',['controlled'],{muscles:['side-delts']}),
  exercise('bodyweight-lateral-raise','הרחקות ידיים ללא משקל','Bodyweight Lateral Raise','shoulders',['bodyweight'],'shoulder-abduction',['low-load'],{muscles:['side-delts']}),
  exercise('rear-delt-fly','פרפר הפוך','Rear Delt Fly','shoulders',['dumbbells','gym'],'shoulder-horizontal-abduction',['shoulder-moderate'],{muscles:['rear-delts','upper-back']}),

  exercise('dumbbell-biceps-curl','כפיפת מרפקים','Dumbbell Biceps Curl','arms',['dumbbells','bands','gym'],'elbow-flexion',[],{muscles:['biceps']}),
  exercise('hammer-curl','כפיפת פטיש','Hammer Curl','arms',['dumbbells'],'elbow-flexion',[],{muscles:['biceps','brachialis']}),
  exercise('cable-biceps-curl','כפיפת מרפקים בכבל','Cable Biceps Curl','arms',['gym'],'elbow-flexion',['controlled'],{muscles:['biceps']}),
  exercise('triceps-pushdown','פשיטת מרפקים בכבל','Triceps Pushdown','arms',['gym','bands'],'elbow-extension',['shoulder-friendly'],{muscles:['triceps']}),
  exercise('overhead-triceps-extension','פשיטת מרפקים מעל הראש','Overhead Triceps Extension','arms',['dumbbells','bands'],'elbow-extension',['overhead-heavy'],{muscles:['triceps']}),
  exercise('bench-dips','מקבילים על ספסל','Bench Dips','arms',['bodyweight'],'elbow-extension',['deep-dip','shoulder-demanding'],{level:'intermediate',muscles:['triceps','chest']}),

  exercise('plank','פלאנק','Plank','core',['bodyweight'],'anti-extension',['back-friendly'],{mode:'seconds',secondsRange:[20,45],muscles:['core']}),
  exercise('dead-bug','דד באג','Dead Bug','core',['bodyweight'],'anti-extension',['back-friendly','low-load'],{muscles:['core']}),
  exercise('bird-dog','בירד דוג','Bird Dog','core',['bodyweight'],'anti-rotation',['back-friendly','low-load'],{unilateral:true,muscles:['core','glutes']}),
  exercise('side-plank','פלאנק צד','Side Plank','core',['bodyweight'],'anti-lateral-flexion',['back-friendly'],{mode:'seconds',secondsRange:[15,40],level:'intermediate',muscles:['core']}),
  exercise('pallof-press','פאלוף פרס','Pallof Press','core',['bands','gym'],'anti-rotation',['back-friendly'],{muscles:['core']}),
]);

export const EXERCISE_BY_ID = Object.freeze(Object.fromEntries(EXERCISES.map((entry) => [entry.id, entry])));

export function exerciseSupportsEquipment(exerciseEntry, equipment = []) {
  const allowed = new Set(equipment);
  return exerciseEntry.equipment.some((item) => allowed.has(item));
}

export function exerciseIsSafeForPrescription(exerciseEntry, prescription) {
  if (!exerciseSupportsEquipment(exerciseEntry, prescription.equipment)) return false;
  if (prescription.avoidMovementTags.some((tag) => exerciseEntry.movementTags.includes(tag))) return false;
  const rank = { beginner: 0, intermediate: 1, advanced: 2 };
  const userRank = rank[prescription.level ?? 'beginner'] ?? 0;
  return (rank[exerciseEntry.level] ?? 0) <= userRank;
}

export function alternativesForExercise(exerciseId, prescription) {
  const source = EXERCISE_BY_ID[exerciseId];
  if (!source) return [];
  return EXERCISES
    .filter((entry) => entry.id !== exerciseId)
    .filter((entry) => exerciseIsSafeForPrescription(entry, prescription))
    .filter((entry) => entry.group === source.group || entry.movementPattern === source.movementPattern)
    .sort((a, b) => {
      const aPattern = a.movementPattern === source.movementPattern ? 1 : 0;
      const bPattern = b.movementPattern === source.movementPattern ? 1 : 0;
      return bPattern - aPattern || a.id.localeCompare(b.id);
    });
}
