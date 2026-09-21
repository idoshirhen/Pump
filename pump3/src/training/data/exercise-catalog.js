function exercise(id, he, en, group, equipment, movementTags, { level = 'beginner', mode = 'reps', repRange = null, secondsRange = null, muscles = [], aliases = [] } = {}) {
  return Object.freeze({ id, names: Object.freeze({ he, en }), group, equipment: Object.freeze(equipment), movementTags: Object.freeze(movementTags), level, mode, repRange: repRange ? Object.freeze(repRange) : null, secondsRange: secondsRange ? Object.freeze(secondsRange) : null, muscles: Object.freeze(muscles), aliases: Object.freeze(aliases) });
}

export const EXERCISES = Object.freeze([
  exercise('squat','סקוואט','Squat','legs',['bodyweight','dumbbells','gym'],['squat-pattern','deep-knee-flexion'],{muscles:['quads','glutes']}),
  exercise('leg-press','לחיצת רגליים','Leg Press','legs',['gym'],['squat-pattern','deep-knee-flexion'],{muscles:['quads','glutes']}),
  exercise('glute-bridge','גשר ישבן','Glute Bridge','legs',['bodyweight','dumbbells','gym'],['hip-extension','back-friendly','knee-friendly'],{muscles:['glutes','hamstrings']}),
  exercise('lateral-band-walk','הליכת צד עם גומייה','Lateral Band Walk','legs',['bands'],['hip-abduction','knee-friendly'],{muscles:['glute-medius']}),
  exercise('push-up','שכיבות סמיכה','Push-Up','chest',['bodyweight'],['horizontal-press','shoulder-demanding'],{muscles:['chest','triceps','shoulders']}),
  exercise('incline-push-up','שכיבות סמיכה בשיפוע','Incline Push-Up','chest',['bodyweight'],['horizontal-press','shoulder-moderate'],{muscles:['chest','triceps']}),
  exercise('wall-press','לחיצה מול קיר','Wall Press','chest',['bodyweight'],['horizontal-press','shoulder-friendly'],{muscles:['chest','triceps']}),
  exercise('band-chest-press','לחיצת חזה עם גומייה','Band Chest Press','chest',['bands'],['horizontal-press'],{muscles:['chest','triceps']}),
  exercise('dumbbell-floor-press','לחיצת חזה עם משקולות בשכיבה','Dumbbell Floor Press','chest',['dumbbells'],['horizontal-press','shoulder-friendly'],{muscles:['chest','triceps']}),
  exercise('chest-press-machine','לחיצת חזה במכונה','Chest Press Machine','chest',['gym'],['horizontal-press','supported'],{muscles:['chest','triceps']}),
  exercise('bench-dips','מקבילים על ספסל','Bench Dips','arms',['bodyweight'],['deep-dip','shoulder-demanding'],{level:'intermediate',muscles:['triceps','chest']}),
  exercise('one-arm-dumbbell-row','חתירה ביד אחת','One-Arm Dumbbell Row','back',['dumbbells'],['horizontal-pull','supported'],{muscles:['lats','upper-back','biceps']}),
  exercise('resistance-band-row','חתירה עם גומייה','Resistance Band Row','back',['bands'],['horizontal-pull','back-friendly'],{muscles:['upper-back','lats','biceps']}),
  exercise('seated-cable-row','חתירה בכבל','Seated Cable Row','back',['gym'],['horizontal-pull','supported'],{muscles:['upper-back','lats','biceps']}),
  exercise('lat-pulldown','פולי עליון','Lat Pulldown','back',['gym'],['vertical-pull'],{muscles:['lats','biceps']}),
  exercise('seated-scapular-retraction','קירוב שכמות בישיבה','Seated Scapular Retraction','posture',['bodyweight'],['scapular-control','shoulder-friendly','back-friendly'],{muscles:['mid-traps','rhomboids']}),
  exercise('gentle-scapular-retraction','קירוב שכמות עדין','Gentle Scapular Retraction','posture',['bodyweight'],['scapular-control','shoulder-friendly','back-friendly'],{muscles:['mid-traps','rhomboids']}),
  exercise('prone-ytw','Y-T-W בשכיבה','Prone Y-T-W','posture',['bodyweight'],['scapular-control','shoulder-moderate'],{muscles:['rear-delts','mid-traps']}),
  exercise('dumbbell-shoulder-press','לחיצת כתפיים','Dumbbell Shoulder Press','shoulders',['dumbbells','gym'],['vertical-press','overhead-heavy'],{muscles:['shoulders','triceps']}),
  exercise('dumbbell-lateral-raise','הרחקות לצדדים','Lateral Raise','shoulders',['dumbbells','gym'],['shoulder-abduction'],{muscles:['side-delts']}),
  exercise('bodyweight-lateral-raise','הרחקות ידיים ללא משקל','Bodyweight Lateral Raise','shoulders',['bodyweight'],['shoulder-abduction','low-load'],{muscles:['side-delts']}),
  exercise('dumbbell-biceps-curl','כפיפת מרפקים','Dumbbell Biceps Curl','arms',['dumbbells','bands','gym'],['elbow-flexion'],{muscles:['biceps']}),
  exercise('hammer-curl','כפיפת פטיש','Hammer Curl','arms',['dumbbells'],['elbow-flexion'],{muscles:['biceps','brachialis']}),
  exercise('overhead-triceps-extension','פשיטת מרפקים מעל הראש','Overhead Triceps Extension','arms',['dumbbells','bands'],['elbow-extension','overhead-heavy'],{muscles:['triceps']}),
  exercise('plank','פלאנק','Plank','core',['bodyweight'],['anti-extension','back-friendly'],{mode:'seconds',secondsRange:[20,45],muscles:['core']}),
  exercise('dead-bug','דד באג','Dead Bug','core',['bodyweight'],['anti-extension','back-friendly'],{muscles:['core']}),
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
