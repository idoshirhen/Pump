const CUES = Object.freeze({
  'squat': { he: ['עמוד ברוחב נוח, חזה פתוח והבטן אסופה.', 'שלח אגן לאחור ולמטה ועלֵה דרך כל כף הרגל.'], en: ['Stand at a comfortable width with chest tall and core braced.', 'Sit hips back and down, then drive through the whole foot.'] },
  'box-squat': { he: ['עמוד מול קופסה/כיסא יציב והחזק גוף אסוף.', 'רד בשליטה עד נגיעה קלה וחזור לעמידה בלי לקרוס קדימה.'], en: ['Stand in front of a stable box or chair with the trunk braced.', 'Lower under control to a light touch, then stand without collapsing forward.'] },
  'leg-press': { he: ['מקם את כפות הרגליים יציב על הפלטה והצמד גב למשענת.', 'כופף ויישר את הברכיים בשליטה בלי לנעול אותן בכוח.'], en: ['Plant both feet firmly on the platform and keep the back supported.', 'Bend and extend the knees under control without forcefully locking them.'] },
  'glute-bridge': { he: ['שכב על הגב, ברכיים כפופות וכפות רגליים על הרצפה.', 'דחוף דרך העקבים והרם אגן עד קו ישר כתפיים–ברכיים.'], en: ['Lie on your back with knees bent and feet planted.', 'Drive through the heels and lift the hips until shoulders, hips and knees align.'] },
  'hip-thrust': { he: ['השען שכמות על ספסל יציב וכפות רגליים שטוחות.', 'הרם אגן בעזרת הישבן ושמור את הצלעות אסופות.'], en: ['Set the shoulder blades on a stable bench with feet flat.', 'Drive the hips up with the glutes while keeping the ribs stacked.'] },
  'lateral-band-walk': { he: ['מקם גומייה ושמור ברכיים מעט כפופות.', 'צעד הצידה בשליטה ושמור מתח רציף בגומייה.'], en: ['Set the band and keep a small bend in the knees.', 'Step sideways under control while keeping continuous band tension.'] },
  'standing-band-leg-curl': { he: ['עמוד יציב והחזק את הירך במקום.', 'כופף את הברך נגד הגומייה בלי להזיז את האגן.'], en: ['Stand tall and keep the thigh still.', 'Curl the knee against the band without shifting the pelvis.'] },
  'calf-raise': { he: ['עמוד זקוף עם משקל מאוזן על קדמת כף הרגל.', 'עלה על קצות האצבעות, עצור קצר וירד לאט.'], en: ['Stand tall with pressure balanced over the forefoot.', 'Rise onto the toes, pause briefly, then lower slowly.'] },
  'step-up': { he: ['הנח את כל כף הרגל על מדרגה יציבה.', 'עלה דרך הרגל שעל המדרגה וירד בשליטה.'], en: ['Place the whole foot on a stable step.', 'Drive through the working leg to stand, then lower under control.'] },
  'push-up': { he: ['ידיים מתחת/מעט מחוץ לכתפיים והגוף בקו אחד.', 'רד כחטיבה אחת ודחוף את הרצפה עד חזרה מלאה.'], en: ['Place hands under or slightly outside the shoulders and keep a straight body line.', 'Lower as one unit and press the floor away to return.'] },
  'incline-push-up': { he: ['הנח ידיים על משטח יציב ושמור גוף בקו ישר.', 'קרב חזה למשטח ודחוף חזרה בלי לשקוע בגב.'], en: ['Place hands on a stable elevated surface and keep the body straight.', 'Bring the chest toward the surface and press back without sagging.'] },
  'wall-press': { he: ['עמוד מול קיר, ידיים בגובה חזה וגוף בקו ישר.', 'כופף מרפקים לכיוון הקיר ודחוף חזרה בשליטה.'], en: ['Stand facing a wall with hands at chest height and body aligned.', 'Bend the elbows toward the wall, then press back under control.'] },
  'band-chest-press': { he: ['עגן גומייה מאחור בגובה החזה ועמוד יציב.', 'דחוף ידיים קדימה והחזר לאט בלי לאבד מתח.'], en: ['Anchor the band behind you at chest height and stand stable.', 'Press the hands forward, then return slowly without losing tension.'] },
  'dumbbell-floor-press': { he: ['שכב על הגב עם משקולות מעל החזה ומרפקים בשליטה.', 'הורד עד נגיעה עדינה של הזרועות ברצפה ודחוף למעלה.'], en: ['Lie on the floor with dumbbells over the chest and elbows controlled.', 'Lower until the upper arms lightly touch the floor, then press up.'] },
  'dumbbell-bench-press': { he: ['שכב יציב על הספסל וכפות רגליים על הרצפה.', 'הורד משקולות בשליטה לצד החזה ודחוף חזרה.'], en: ['Lie securely on the bench with feet planted.', 'Lower the dumbbells under control beside the chest, then press back up.'] },
  'chest-press-machine': { he: ['כוון מושב כך שהידיות סביב גובה החזה.', 'דחוף קדימה והחזר לאט תוך שמירה על הגב במשענת.'], en: ['Set the seat so the handles sit around chest height.', 'Press forward and return slowly while keeping the back supported.'] },
  'cable-chest-fly': { he: ['עמוד יציב עם מרפקים מעט כפופים.', 'קרב את הידיים בקשת מול החזה והחזר בשליטה.'], en: ['Stand stable with a soft bend in the elbows.', 'Bring the hands together in an arc in front of the chest, then return under control.'] },
  'one-arm-dumbbell-row': { he: ['תמוך בגוף, שמור גב ניטרלי והכתף רחוקה מהאוזן.', 'משוך את המרפק לאחור לכיוון האגן והורד לאט.'], en: ['Support the body, keep a neutral back and shoulder away from the ear.', 'Drive the elbow back toward the hip, then lower slowly.'] },
  'resistance-band-row': { he: ['עגן גומייה מולך ושב/עמוד עם חזה פתוח.', 'משוך מרפקים לאחור וקירב שכמות בלי להרים כתפיים.'], en: ['Anchor the band in front and sit or stand tall.', 'Pull elbows back and bring the shoulder blades together without shrugging.'] },
  'seated-cable-row': { he: ['שב זקוף והחזק את הידית עם כתפיים נמוכות.', 'משוך לכיוון הגוף דרך המרפקים והחזר בשליטה.'], en: ['Sit tall with the shoulders down and hold the handle securely.', 'Pull toward the body through the elbows, then return under control.'] },
  'chest-supported-row': { he: ['הצמד חזה לתמיכה ושמור צוואר ניטרלי.', 'משוך מרפקים לאחור ועצור קצר לפני הירידה.'], en: ['Keep the chest supported and neck neutral.', 'Pull the elbows back, pause briefly, then lower with control.'] },
  'lat-pulldown': { he: ['אחוז במוט, שב יציב והורד כתפיים.', 'משוך את המוט לכיוון החזה העליון והחזר לאט.'], en: ['Grip the bar, sit securely and set the shoulders down.', 'Pull the bar toward the upper chest, then return slowly.'] },
  'band-lat-pulldown': { he: ['עגן גומייה מעל הראש ושמור גוף יציב.', 'משוך מרפקים מטה לצדדים והחזר בשליטה.'], en: ['Anchor the band overhead and keep the torso stable.', 'Drive the elbows down by the sides, then return under control.'] },
  'dumbbell-pullover': { he: ['שכב יציב והחזק משקולת מעל החזה עם מרפקים רכים.', 'העבר את המשקולת לאחור בטווח נוח והחזר מעל החזה.'], en: ['Lie securely and hold the dumbbell over the chest with soft elbows.', 'Move it back through a comfortable range, then return over the chest.'] },
  'seated-scapular-retraction': { he: ['שב זקוף עם ידיים רפויות.', 'קירב שכמות בעדינות לאחור ולמטה בלי להזיז את הצוואר.'], en: ['Sit tall with the arms relaxed.', 'Gently draw the shoulder blades back and down without moving the neck.'] },
  'gentle-scapular-retraction': { he: ['עמוד או שב נינוח עם כתפיים רפויות.', 'אסוף שכמות קלות לאחור, עצור ושחרר בלי מאמץ גדול.'], en: ['Stand or sit comfortably with relaxed shoulders.', 'Lightly draw the shoulder blades back, pause, then release without straining.'] },
  'prone-ytw': { he: ['שכב על הבטן ושמור צוואר ניטרלי.', 'הרם ידיים בצורות Y, T ו-W בתנועה קטנה ומבוקרת.'], en: ['Lie face down and keep the neck neutral.', 'Lift the arms through Y, T and W shapes with small controlled motion.'] },
  'band-face-pull': { he: ['עגן גומייה בגובה הפנים ואחוז בשתי ידיים.', 'משוך לכיוון הפנים עם מרפקים פתוחים וקירוב שכמות.'], en: ['Anchor the band around face height and hold both ends.', 'Pull toward the face with elbows open and shoulder blades drawing together.'] },
  'cable-face-pull': { he: ['כוון כבל לגובה הפנים ועמוד יציב.', 'משוך את החבל לכיוון הפנים עם מרפקים פתוחים והחזר בשליטה.'], en: ['Set the cable around face height and stand stable.', 'Pull the rope toward the face with elbows open, then return under control.'] },
  'dumbbell-shoulder-press': { he: ['התחל עם משקולות בגובה כתפיים וגוף אסוף.', 'דחוף מעל הראש בטווח נוח והורד בשליטה.'], en: ['Start with dumbbells at shoulder height and brace the trunk.', 'Press overhead through a comfortable range, then lower with control.'] },
  'machine-shoulder-press': { he: ['כוון מושב כך שהידיות סביב גובה הכתפיים.', 'דחוף למעלה בלי למשוך כתפיים לאוזניים והחזר לאט.'], en: ['Set the seat so the handles start around shoulder height.', 'Press up without shrugging, then return slowly.'] },
  'dumbbell-lateral-raise': { he: ['עמוד יציב עם משקולות לצד הגוף ומרפקים רכים.', 'הרם ידיים לצדדים עד טווח נוח והורד לאט.'], en: ['Stand stable with dumbbells by the sides and soft elbows.', 'Raise the arms out to a comfortable height, then lower slowly.'] },
  'band-lateral-raise': { he: ['עמוד על הגומייה והחזק מתח התחלתי קל.', 'הרם ידיים לצדדים בשליטה והורד בלי לאבד מתח.'], en: ['Stand on the band with light starting tension.', 'Raise the arms out to the sides under control and lower without losing tension.'] },
  'bodyweight-lateral-raise': { he: ['עמוד זקוף עם ידיים לצד הגוף.', 'הרם ידיים לצדדים בקצב איטי ושמור כתפיים נמוכות.'], en: ['Stand tall with the arms by the sides.', 'Raise the arms sideways slowly while keeping the shoulders down.'] },
  'rear-delt-fly': { he: ['הטה גוף/הישען לתמיכה עם גב ניטרלי.', 'פתח ידיים לצדדים וקירב שכמות בלי תנופה.'], en: ['Hinge or use support while keeping a neutral back.', 'Open the arms out and squeeze the shoulder blades without swinging.'] },
  'dumbbell-biceps-curl': { he: ['עמוד יציב עם מרפקים קרובים לגוף.', 'כופף מרפקים והרם משקולות בלי להזיז את הכתפיים.'], en: ['Stand stable with elbows close to the body.', 'Curl the weights without letting the shoulders drift forward.'] },
  'hammer-curl': { he: ['החזק משקולות באחיזה ניטרלית, אגודלים כלפי מעלה.', 'כופף מרפקים בלי תנופה והורד בשליטה.'], en: ['Hold the dumbbells with a neutral grip, thumbs up.', 'Curl without swinging, then lower under control.'] },
  'cable-biceps-curl': { he: ['עמוד יציב מול הכבל ושמור מרפקים לצד הגוף.', 'כופף מרפקים נגד הכבל והחזר לאט.'], en: ['Stand stable at the cable with elbows by the sides.', 'Curl against the cable, then return slowly.'] },
  'triceps-pushdown': { he: ['עמוד זקוף והצמד מרפקים לצד הגוף.', 'יישר מרפקים כלפי מטה והחזר בלי להזיז את הזרוע העליונה.'], en: ['Stand tall with elbows pinned near the torso.', 'Extend the elbows downward, then return without moving the upper arms.'] },
  'overhead-triceps-extension': { he: ['החזק משקולת/גומייה מעל הראש עם גוף אסוף.', 'כופף ויישר מרפקים תוך שמירה על הזרועות יציבות.'], en: ['Hold the weight or band overhead with the trunk braced.', 'Bend and straighten the elbows while keeping the upper arms steady.'] },
  'bench-dips': { he: ['הנח ידיים על ספסל יציב ושמור כתפיים רחוקות מהאוזניים.', 'רד בטווח נוח דרך המרפקים ודחוף חזרה.'], en: ['Place the hands on a stable bench and keep shoulders away from the ears.', 'Lower through a comfortable elbow range, then press back up.'] },
  'plank': { he: ['מרפקים מתחת לכתפיים והגוף בקו ישר.', 'כווץ בטן וישבן ושמור נשימה רגילה לאורך הזמן.'], en: ['Set elbows under the shoulders and keep the body in one line.', 'Brace the core and glutes while breathing normally.'] },
  'dead-bug': { he: ['שכב על הגב, ברכיים מעל האגן וידיים למעלה.', 'הרחיק יד ורגל נגדיות בלי לאבד מגע של הגב התחתון.'], en: ['Lie on your back with knees over hips and arms up.', 'Reach opposite arm and leg away without losing low-back control.'] },
  'bird-dog': { he: ['עמוד על שש עם גב ניטרלי ובטן אסופה.', 'שלח יד ורגל נגדיות בלי לסובב את האגן.'], en: ['Start on all fours with a neutral spine and braced core.', 'Reach opposite arm and leg without rotating the pelvis.'] },
  'side-plank': { he: ['מקם מרפק מתחת לכתף והרם את האגן.', 'שמור גוף בקו ישר ונשום לאורך ההחזקה.'], en: ['Set the elbow under the shoulder and lift the hips.', 'Keep the body in a straight line and breathe through the hold.'] },
  'pallof-press': { he: ['עמוד לצד נקודת העיגון והחזק ידית מול החזה.', 'דחוף ידיים קדימה בלי לתת לגוף להסתובב.'], en: ['Stand sideways to the anchor and hold the handle at the chest.', 'Press the hands forward without letting the torso rotate.'] },
});

export function instructionForExercise(exerciseId) {
  const cue = CUES[exerciseId];
  if (!cue) return null;
  return Object.freeze({
    he: Object.freeze([...cue.he]),
    en: Object.freeze([...cue.en]),
  });
}

export function hasExerciseInstructions(exerciseId) {
  return Boolean(CUES[exerciseId]);
}

export { CUES as EXERCISE_INSTRUCTIONS };
