import assert from 'node:assert/strict';
import { normalizePersonalizationProfile } from '../src/personalization/profile.js';
import { calculatePersonalizedTargets } from '../src/personalization/targets.js';
import { buildPersonalizedPlan } from '../src/personalization/engine.js';

const maleGainInput = {
  id: 'male-gain', sex: 'male', age: 33, heightCm: 172, weightKg: 62, targetWeightKg: 66,
  goal: 'gain', activity: 'medium', trainingLevel: 'intermediate', trainingPlace: 'home', trainingDays: 4,
  personalization: {
    foodStyle: 'regular', avoid: [], favorites: ['chicken', 'rice'], dislikes: [],
    equipment: ['dumbbells', 'bands'], trainingFocus: 'upper', limitation: 'none', sessionMinutes: 30,
  },
};

const maleProfile = normalizePersonalizationProfile(maleGainInput);
assert.equal(maleProfile.diet, 'omnivore');
assert.equal(maleProfile.sex, 'male');
assert.equal(maleProfile.sessionMinutes, 30);
assert.deepEqual(maleProfile.equipment, ['dumbbells', 'bands']);

const maleTargets = calculatePersonalizedTargets(maleProfile);
assert.equal(maleTargets.method.bmr, 'mifflin-st-jeor');
assert.ok(maleTargets.calories > maleTargets.maintenanceCalories, 'gain target should exceed maintenance');
assert.equal(maleTargets.protein, 99.2);
assert.ok(maleTargets.audit.length >= 4);

const femaleLossProfile = normalizePersonalizationProfile({
  id: 'female-loss', sex: 'female', age: 33, heightCm: 172, weightKg: 78, targetWeightKg: 68,
  goal: 'lose', activity: 'light', trainingLevel: 'beginner', trainingPlace: 'gym', trainingDays: 3,
  personalization: { foodStyle: 'vegetarian', avoid: ['dairy'], equipment: ['gym'], trainingFocus: 'lower', limitation: 'knee', sessionMinutes: 45 },
});
const femaleTargets = calculatePersonalizedTargets(femaleLossProfile);
assert.ok(femaleTargets.calories < femaleTargets.maintenanceCalories, 'loss target should be below maintenance');
assert.equal(femaleTargets.protein, 140.4);
assert.notEqual(femaleTargets.calories, maleTargets.calories, 'different users must produce different targets');

const first = buildPersonalizedPlan(maleGainInput, { dateKey: '2026-09-21' });
const second = buildPersonalizedPlan(maleGainInput, { dateKey: '2026-09-21' });
assert.deepEqual(first, second, 'same profile/date must produce the same plan');
assert.equal(first.nutrition.status, 'ready');
assert.ok(first.nutrition.withinTolerance, 'supported profile should receive a nutrition plan inside daily tolerance');
assert.equal(first.training.daysPerWeek, 4);
assert.equal(first.training.maxExercisesPerSession, 5);
assert.deepEqual(first.training.split, ['upper-a', 'lower-maintenance-a', 'upper-b', 'lower-maintenance-b']);

const tomorrow = buildPersonalizedPlan(maleGainInput, { dateKey: '2026-09-22' });
assert.notEqual(first.audit.deterministicSeed, tomorrow.audit.deterministicSeed, 'date rotates deterministic seed');

const kneePlan = buildPersonalizedPlan({
  id: 'knee-user', sex: 'female', age: 40, heightCm: 165, weightKg: 70, targetWeightKg: 65,
  goal: 'lose', activity: 'light', trainingLevel: 'beginner', trainingPlace: 'gym', trainingDays: 3,
  personalization: { foodStyle: 'regular', avoid: [], equipment: ['gym'], trainingFocus: 'lower', limitation: 'knee', sessionMinutes: 20 },
});
assert.ok(kneePlan.training.avoidMovementTags.includes('impact'));
assert.ok(kneePlan.training.avoidMovementTags.includes('deep-knee-flexion'));
assert.equal(kneePlan.training.maxExercisesPerSession, 4);

const rejectedMealId = first.nutrition.meals[0].template.id;
const feedbackPlan = buildPersonalizedPlan({
  ...maleGainInput,
  id: 'male-feedback',
  mealFeedback: [{ recipeId: rejectedMealId, feedback: 'not_for_me' }],
}, { dateKey: '2026-09-21' });
assert.ok(feedbackPlan.audit.excludedMealIds.includes(rejectedMealId));
assert.equal(feedbackPlan.nutrition.meals.some((entry) => entry.template.id === rejectedMealId), false, 'negative feedback must remove a meal');

const dairyFreeVegetarian = buildPersonalizedPlan({
  id: 'veg-dairy-free', sex: 'female', age: 31, heightCm: 168, weightKg: 64, targetWeightKg: 64,
  goal: 'maintain', activity: 'medium', trainingLevel: 'intermediate', trainingPlace: 'home', trainingDays: 3,
  personalization: { foodStyle: 'vegetarian', avoid: ['dairy'], equipment: ['dumbbells'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
}, { dateKey: '2026-09-21' });
assert.equal(dairyFreeVegetarian.nutrition.status, 'ready');
for (const entry of dairyFreeVegetarian.nutrition.meals) {
  assert.equal(entry.template.tags.includes('dairy'), false, 'dairy-free profile must not receive dairy meals');
}

const veganSoyFree = buildPersonalizedPlan({
  id: 'vegan-soy-free', sex: 'male', age: 29, heightCm: 178, weightKg: 74, targetWeightKg: 74,
  goal: 'maintain', activity: 'medium', trainingLevel: 'intermediate', trainingPlace: 'home', trainingDays: 4,
  personalization: { foodStyle: 'vegan', avoid: ['soy'], equipment: ['bodyweight', 'bands'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30 },
}, { dateKey: '2026-09-21' });
assert.equal(veganSoyFree.nutrition.status, 'blocked', 'unsupported restriction combinations must be explicit, not faked');
assert.ok(veganSoyFree.nutrition.missingSlots.length >= 1);

assert.throws(() => normalizePersonalizationProfile({
  sex: 'male', age: 33, heightCm: 172, weightKg: 70, targetWeightKg: 80, goal: 'lose', activity: 'light',
}), /lose goal/);

console.log('PUMP 3 personalization engine checks passed');
