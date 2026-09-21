import { normalizePersonalizationProfile } from './profile.js';
import { calculatePersonalizedTargets } from './targets.js';
import { buildMealFeedbackModel, mealAllowedForProfile, scoreMealForProfile } from './meal-preferences.js';
import { createTrainingPrescription } from './training-prescription.js';
import { planDailyNutrition } from '../nutrition/engine/day-planner.js';

function stableSeed(input) {
  const text = String(input ?? 'pump3');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function buildPersonalizedPlan(input, { dateKey = 'default' } = {}) {
  const profile = normalizePersonalizationProfile(input);
  const targets = calculatePersonalizedTargets(profile);
  const feedback = buildMealFeedbackModel(profile.mealFeedback);
  const seed = stableSeed(`${profile.id}:${dateKey}`);

  const nutrition = planDailyNutrition(targets, {
    diet: profile.diet,
    seed,
    candidateFilter: (template) => mealAllowedForProfile(template, profile, feedback),
    candidateScore: (template) => scoreMealForProfile(template, profile, feedback),
  });
  const training = createTrainingPrescription(profile);

  return Object.freeze({
    profile,
    targets,
    nutrition,
    training,
    audit: Object.freeze({
      targetRules: targets.audit,
      trainingRules: training.audit,
      excludedMealIds: Object.freeze([...feedback.excludedMealIds]),
      deterministicSeed: seed,
    }),
  });
}

export { stableSeed };
