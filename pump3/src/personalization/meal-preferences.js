import { RETAINED_MEAL_BY_ID } from '../nutrition/data/meal-catalog.js';

const RESTRICTED_FOOD_IDS = Object.freeze({
  dairy: new Set(['cottage-5', 'white-cheese-5', 'yellow-cheese-9', 'bulgarian-cheese-5', 'salty-cheese-5', 'protein-yogurt-2-9', 'natural-yogurt-2-8']),
  eggs: new Set(['whole-egg', 'hard-boiled-egg']),
  soy: new Set(['tofu-firm', 'vegetables-stir-fried']),
  gluten: new Set(['pasta-cooked', 'bulgur-cooked', 'ptitim-cooked-tomato', 'couscous-cooked']),
  nuts: new Set(['peanut-butter']),
});

const NON_AFFINITY_TAGS = new Set(['vegan', 'vegetarian', 'meat', 'fish', 'plant']);

function feedbackKind(entry) {
  return String(entry?.feedback ?? entry?.type ?? '').trim().toLowerCase();
}

export function buildMealFeedbackModel(feedback = []) {
  const excludedMealIds = new Set();
  const mealScores = new Map();
  const tagScores = new Map();
  for (const entry of feedback) {
    const recipeId = String(entry?.recipeId ?? entry?.mealId ?? '').trim();
    if (!recipeId) continue;
    const kind = feedbackKind(entry);
    const template = RETAINED_MEAL_BY_ID[recipeId];
    if (['not_for_me', 'dislike', 'never_again'].includes(kind)) excludedMealIds.add(recipeId);
    if (['liked', 'love', 'favorite'].includes(kind)) {
      mealScores.set(recipeId, (mealScores.get(recipeId) ?? 0) + 8);
      for (const tag of template?.tags ?? []) {
        if (!NON_AFFINITY_TAGS.has(tag)) tagScores.set(tag, (tagScores.get(tag) ?? 0) + 1);
      }
    }
    if (['too_expensive', 'too_slow', 'not_filling'].includes(kind)) mealScores.set(recipeId, (mealScores.get(recipeId) ?? 0) - 3);
  }
  return { excludedMealIds, mealScores, tagScores };
}

export function mealAllowedForProfile(template, profile, feedbackModel = buildMealFeedbackModel(profile.mealFeedback)) {
  if (feedbackModel.excludedMealIds.has(template.id)) return false;
  if (profile.diet === 'vegan' && !template.tags.includes('vegan')) return false;
  if (profile.diet === 'vegetarian' && (template.tags.includes('meat') || template.tags.includes('fish'))) return false;

  for (const avoid of profile.avoid) {
    if (template.tags.includes(avoid)) return false;
    const blocked = RESTRICTED_FOOD_IDS[avoid];
    if (blocked && template.items.some((entry) => blocked.has(entry.foodId))) return false;
  }
  for (const disliked of profile.dislikedTags) {
    if (template.tags.includes(disliked)) return false;
  }
  return true;
}

export function scoreMealForProfile(template, profile, feedbackModel = buildMealFeedbackModel(profile.mealFeedback)) {
  let score = feedbackModel.mealScores.get(template.id) ?? 0;
  for (const tag of profile.preferredTags) if (template.tags.includes(tag)) score += 2;
  for (const tag of template.tags) score += feedbackModel.tagScores.get(tag) ?? 0;
  return score;
}

export { RESTRICTED_FOOD_IDS };
