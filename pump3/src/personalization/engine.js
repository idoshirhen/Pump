import { normalizePersonalizationProfile } from './profile.js';
import { calculatePersonalizedTargets } from './targets.js';
import { buildMealFeedbackModel, mealAllowedForProfile, scoreMealForProfile } from './meal-preferences.js';
import { createTrainingPrescription } from './training-prescription.js';
import { buildWorkoutPlan } from '../training/engine/workout-engine.js';
import { planDailyNutrition } from '../nutrition/engine/day-planner.js';
import { mealsForSlot } from '../nutrition/data/meal-catalog.js';

function stableSeed(input) {
  const text = String(input ?? 'pump3');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function plannerDiet(profile) {
  return profile.diet === 'vegetarian' ? 'omnivore' : profile.diet;
}

function nutritionCoverage(profile, feedback) {
  const slots = ['breakfast', 'lunch', 'dinner', 'snack'];
  const eligibleBySlot = Object.fromEntries(slots.map((slot) => {
    const eligible = mealsForSlot(slot, { diet: plannerDiet(profile) })
      .filter((template) => mealAllowedForProfile(template, profile, feedback));
    return [slot, eligible.map((template) => template.id)];
  }));
  const missingSlots = slots.filter((slot) => eligibleBySlot[slot].length === 0);
  return { eligibleBySlot, missingSlots, supported: missingSlots.length === 0 };
}

export function buildPersonalizedPlan(input, { dateKey = 'default' } = {}) {
  const profile = normalizePersonalizationProfile(input);
  const targets = calculatePersonalizedTargets(profile);
  const feedback = buildMealFeedbackModel(profile.mealFeedback);
  const seed = stableSeed(`${profile.id}:${dateKey}`);
  const coverage = nutritionCoverage(profile, feedback);

  const nutrition = coverage.supported
    ? { status: 'ready', ...planDailyNutrition(targets, {
      diet: plannerDiet(profile),
      seed,
      candidateFilter: (template) => mealAllowedForProfile(template, profile, feedback),
      candidateScore: (template) => scoreMealForProfile(template, profile, feedback),
    }) }
    : {
      status: 'blocked',
      reason: 'no-safe-meal-coverage',
      missingSlots: Object.freeze([...coverage.missingSlots]),
      eligibleBySlot: Object.freeze(coverage.eligibleBySlot),
    };

  const trainingPrescription = createTrainingPrescription(profile);
  const workoutPlan = buildWorkoutPlan(trainingPrescription);
  const training = Object.freeze({ ...trainingPrescription, plan: workoutPlan });

  return Object.freeze({
    profile,
    targets,
    nutrition: Object.freeze(nutrition),
    training,
    audit: Object.freeze({
      targetRules: targets.audit,
      trainingRules: trainingPrescription.audit,
      trainingEligibleExercises: workoutPlan.audit.eligibleExerciseIds,
      trainingExcludedExercises: workoutPlan.audit.excludedExerciseIds,
      excludedMealIds: Object.freeze([...feedback.excludedMealIds]),
      deterministicSeed: seed,
      nutritionCoverage: Object.freeze(coverage.eligibleBySlot),
    }),
  });
}

export { stableSeed, nutritionCoverage };
