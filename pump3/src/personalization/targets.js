const ACTIVITY_MULTIPLIER = Object.freeze({ sedentary: 1.2, light: 1.375, medium: 1.55, high: 1.725 });
const GOAL_MULTIPLIER = Object.freeze({ lose: 0.85, maintain: 1, gain: 1.10 });
const PROTEIN_PER_KG = Object.freeze({ lose: 1.8, maintain: 1.6, gain: 1.6 });

function roundTo(value, step = 1) {
  return Math.round(value / step) * step;
}

export function calculatePersonalizedTargets(profile) {
  const sexConstant = profile.sex === 'male' ? 5 : -161;
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexConstant;
  const maintenanceCalories = bmr * ACTIVITY_MULTIPLIER[profile.activity];
  const rawCalories = maintenanceCalories * GOAL_MULTIPLIER[profile.goal];
  const calories = roundTo(rawCalories, 10);
  const protein = roundTo(profile.weightKg * PROTEIN_PER_KG[profile.goal], 1);
  const calorieAdjustment = calories - roundTo(maintenanceCalories, 10);

  return Object.freeze({
    calories,
    protein,
    bmr: roundTo(bmr, 1),
    maintenanceCalories: roundTo(maintenanceCalories, 10),
    calorieAdjustment,
    method: Object.freeze({
      bmr: 'mifflin-st-jeor',
      activityMultiplier: ACTIVITY_MULTIPLIER[profile.activity],
      goalMultiplier: GOAL_MULTIPLIER[profile.goal],
      proteinGramsPerKg: PROTEIN_PER_KG[profile.goal],
    }),
    audit: Object.freeze([
      `BMR ${roundTo(bmr, 1)} kcal/day from sex, age, height and weight`,
      `Activity ${profile.activity} x${ACTIVITY_MULTIPLIER[profile.activity]} => maintenance ${roundTo(maintenanceCalories, 10)} kcal/day`,
      `Goal ${profile.goal} x${GOAL_MULTIPLIER[profile.goal]} => target ${calories} kcal/day`,
      `Protein ${PROTEIN_PER_KG[profile.goal]} g/kg x ${profile.weightKg} kg => ${protein} g/day`,
    ]),
  });
}

export { ACTIVITY_MULTIPLIER, GOAL_MULTIPLIER, PROTEIN_PER_KG };
