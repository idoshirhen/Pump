import assert from 'node:assert/strict';
import { normalizePersonalizationProfile } from '../src/personalization/profile.js';
import { calculatePersonalizedTargets } from '../src/personalization/targets.js';
import { buildMealFeedbackModel, mealAllowedForProfile, scoreMealForProfile } from '../src/personalization/meal-preferences.js';
import { createTrainingPrescription } from '../src/personalization/training-prescription.js';
import { buildPersonalizedPlan } from '../src/personalization/engine.js';
import { RETAINED_MEAL_BY_ID } from '../src/nutrition/data/meal-catalog.js';

function base(overrides = {}) {
  return {
    id: 'base', sex: 'male', age: 33, heightCm: 172, weightKg: 70, targetWeightKg: 70,
    goal: 'maintain', activity: 'light', trainingLevel: 'beginner', trainingPlace: 'home', trainingDays: 3,
    personalization: { foodStyle: 'regular', avoid: [], favorites: [], dislikes: [], equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
    ...overrides,
  };
}

// 1) Inputs must be canonical and auditable, not silently guessed.
const normalized = normalizePersonalizationProfile(base());
assert.equal(normalized.diet, 'omnivore');
assert.equal(normalized.sessionMinutes, 30);
assert.throws(() => normalizePersonalizationProfile(base({ sex: 'unknown' })), /sex must be one of/);
assert.throws(() => normalizePersonalizationProfile(base({ age: 10 })), /age must be >= 16/);
assert.throws(() => normalizePersonalizationProfile(base({ goal: 'gain', targetWeightKg: 60 })), /gain goal/);

// 2) Nutrition targets must materially react to profile inputs.
const maintainTargets = calculatePersonalizedTargets(normalized);
const activeTargets = calculatePersonalizedTargets(normalizePersonalizationProfile(base({ activity: 'high' })));
const lossTargets = calculatePersonalizedTargets(normalizePersonalizationProfile(base({ goal: 'lose', targetWeightKg: 62 })));
const gainTargets = calculatePersonalizedTargets(normalizePersonalizationProfile(base({ goal: 'gain', targetWeightKg: 78 })));
assert.ok(activeTargets.calories > maintainTargets.calories, 'higher activity must raise maintenance-derived target');
assert.ok(lossTargets.calories < maintainTargets.calories, 'loss goal must lower calories');
assert.ok(gainTargets.calories > maintainTargets.calories, 'gain goal must raise calories');
assert.ok(lossTargets.protein > maintainTargets.protein, 'loss plan uses higher protein-per-kg rule');
assert.equal(maintainTargets.audit.length, 4, 'target calculation must expose an audit trail');

// 3) Hard dietary restrictions must be enforced at ingredient level.
const dairyFreeProfile = normalizePersonalizationProfile(base({
  id: 'dairy-free',
  personalization: { foodStyle: 'vegetarian', avoid: ['dairy'], favorites: [], dislikes: [], equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
}));
const emptyFeedback = buildMealFeedbackModel([]);
assert.equal(mealAllowedForProfile(RETAINED_MEAL_BY_ID['breakfast-egg-cottage-potato'], dairyFreeProfile, emptyFeedback), false);
assert.equal(mealAllowedForProfile(RETAINED_MEAL_BY_ID['breakfast-tofu-sweet-potato'], dairyFreeProfile, emptyFeedback), true);

const glutenFreeProfile = normalizePersonalizationProfile(base({
  id: 'gluten-free',
  personalization: { foodStyle: 'regular', avoid: ['gluten'], favorites: [], dislikes: [], equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
}));
assert.equal(mealAllowedForProfile(RETAINED_MEAL_BY_ID['lunch-tuna-pasta-tomato'], glutenFreeProfile, emptyFeedback), false);
assert.equal(mealAllowedForProfile(RETAINED_MEAL_BY_ID['lunch-chicken-rice-salad'], glutenFreeProfile, emptyFeedback), true);

// 4) Feedback must affect future selection, including similarity learning.
const likedModel = buildMealFeedbackModel([{ recipeId: 'lunch-chicken-rice-salad', feedback: 'liked' }]);
assert.ok((likedModel.tagScores.get('chicken') ?? 0) > 0, 'liked meal should teach tag affinity');
assert.ok(scoreMealForProfile(RETAINED_MEAL_BY_ID['lunch-chicken-rice-salad'], normalized, likedModel) > 0);
const rejectedModel = buildMealFeedbackModel([{ recipeId: 'lunch-chicken-rice-salad', feedback: 'not_for_me' }]);
assert.equal(mealAllowedForProfile(RETAINED_MEAL_BY_ID['lunch-chicken-rice-salad'], normalized, rejectedModel), false);

// 5) Training prescription must respond independently to frequency, time,
// focus, equipment, level and limitations. Exercise selection itself is section 4.
const shortKnee = createTrainingPrescription(normalizePersonalizationProfile(base({
  trainingDays: 2,
  personalization: { foodStyle: 'regular', avoid: [], favorites: [], dislikes: [], equipment: ['bands'], trainingFocus: 'lower', limitation: 'knee', sessionMinutes: 20 },
})));
const longAdvanced = createTrainingPrescription(normalizePersonalizationProfile(base({
  trainingDays: 5, trainingLevel: 'advanced', trainingPlace: 'gym',
  personalization: { foodStyle: 'regular', avoid: [], favorites: [], dislikes: [], equipment: ['gym'], trainingFocus: 'upper', limitation: 'none', sessionMinutes: 60 },
})));
assert.equal(shortKnee.split.length, 2);
assert.equal(longAdvanced.split.length, 5);
assert.ok(shortKnee.maxExercisesPerSession < longAdvanced.maxExercisesPerSession);
assert.ok(shortKnee.avoidMovementTags.includes('impact'));
assert.equal(longAdvanced.defaultSets, 3);
assert.ok(longAdvanced.audit.length >= 5);

// 6) End-to-end plans must be deterministic, hit nutrition tolerances for
// supported users, and explicitly block unsupported restriction combinations.
const supportedInput = base({
  id: 'supported', goal: 'gain', weightKg: 72, targetWeightKg: 77, activity: 'medium', trainingDays: 4,
  personalization: { foodStyle: 'regular', avoid: ['gluten'], favorites: ['chicken'], dislikes: [], equipment: ['dumbbells', 'bands'], trainingFocus: 'upper', limitation: 'none', sessionMinutes: 30 },
});
const supportedA = buildPersonalizedPlan(supportedInput, { dateKey: '2026-09-21' });
const supportedB = buildPersonalizedPlan(supportedInput, { dateKey: '2026-09-21' });
assert.deepEqual(supportedA, supportedB, 'same inputs must reproduce exactly');
assert.equal(supportedA.nutrition.status, 'ready');
assert.ok(supportedA.nutrition.withinTolerance, 'supported plan must hit daily nutrition tolerance');
assert.equal(supportedA.training.daysPerWeek, 4);
assert.ok(supportedA.audit.targetRules.length > 0 && supportedA.audit.trainingRules.length > 0);

const blocked = buildPersonalizedPlan(base({
  id: 'blocked-vegan-soy',
  personalization: { foodStyle: 'vegan', avoid: ['soy'], favorites: [], dislikes: [], equipment: ['bands'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
}), { dateKey: '2026-09-21' });
assert.equal(blocked.nutrition.status, 'blocked');
assert.equal(blocked.nutrition.reason, 'no-safe-meal-coverage');
assert.ok(blocked.nutrition.missingSlots.length > 0, 'engine must say exactly which meal slots lack safe coverage');

const withRejection = buildPersonalizedPlan({
  ...supportedInput,
  id: 'feedback-e2e',
  mealFeedback: [{ recipeId: supportedA.nutrition.meals[0].template.id, feedback: 'not_for_me' }],
}, { dateKey: '2026-09-21' });
assert.equal(withRejection.nutrition.meals.some((entry) => entry.template.id === supportedA.nutrition.meals[0].template.id), false);

console.log('PUMP 3 section 3 completion contract passed: profile, targets, restrictions, feedback, training prescription and end-to-end personalization are auditable.');
