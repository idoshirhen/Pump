import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bundle = await readFile(new URL('../assets/index-personalized-v2.js', import.meta.url), 'utf8');
const start = bundle.indexOf('function pumpPreferenceList');
const end = bundle.indexOf('function Na(e)', start);
assert.ok(start >= 0 && end > start, 'personalization helpers are present in the generated bundle');

const helpers = bundle.slice(start, end);
const Ma = () => ({ meals: [], snack: 'fallback snack', note: 'fallback note' });
const Na = () => ({ a: {}, b: {}, location: 'fallback', weekly: [] });
const ja = () => ({ calories: 1600, protein: 112 });
const api = new Function('Ma', 'Na', 'ja', `${helpers};return {pumpOnboardingPreferences,pumpCatalogPersonalizedMenu,pumpCatalogPersonalizedSnacks,pumpMealCatalog,pumpNativeMeals,pumpPersonalizedTargets,pumpPersonalizedTraining};`)(Ma, Na, ja);

const base = {
  diet: '', goal: 'lose', startWeight: 70, targetWeight: 62,
  activity: 'light', trainingLevel: 'beginner', trainingPlace: 'home',
  trainingDays: 3, mealPattern: 'three'
};

const veganNoGlutenSoy = {
  foodStyle: 'vegan', avoid: ['gluten', 'soy'], proteins: ['plant'],
  favorites: ['legumes'], dislikes: [], prep: 'quick', budget: 'budget', equipment: ['dumbbells'],
  trainingFocus: 'upper', limitation: 'none', sessionMinutes: '20'
};
const onboardingDefaults = api.pumpOnboardingPreferences({ ...base, personalization: {} });
assert.deepEqual(onboardingDefaults.equipment, ['bodyweight']);
assert.equal(onboardingDefaults.sessionMinutes, '30');
assert.equal(onboardingDefaults.foodStyle, 'regular');
assert.deepEqual(onboardingDefaults.favorites, []);
assert.deepEqual(onboardingDefaults.dislikes, []);
const onboardingGym = api.pumpOnboardingPreferences({ ...base, trainingPlace: 'gym', personalization: { foodStyle: 'vegetarian' } });
assert.deepEqual(onboardingGym.equipment, ['gym']);
assert.equal(onboardingGym.foodStyle, 'vegetarian');

assert.ok(api.pumpMealCatalog.length >= 80, 'the PUMP 2.1 catalogue contains at least 80 curated meals');
const veganMenu = api.pumpCatalogPersonalizedMenu({ ...base, id: 'vegan-1', personalization: veganNoGlutenSoy }, { calories: 1250, protein: 126 }, '2026-08-15');
const veganOptions = veganMenu.meals.flatMap((meal) => meal.options);
assert.equal(veganOptions.length, 9);
assert.equal(veganOptions.every((option) => option.tags.includes('vegan') && !option.tags.includes('gluten') && !option.tags.includes('soy')), true);
assert.equal(veganOptions.every((option) => option.calories > 0 && option.detail.startsWith('כמות מוצעת:')), true);
const veganSnacks = api.pumpCatalogPersonalizedSnacks({ ...base, id: 'vegan-1', personalization: veganNoGlutenSoy }, [170, 250], '2026-08-15');
assert.equal(veganSnacks.flatMap((meal) => meal.options).every((option) => option.tags.includes('vegan') && !option.tags.includes('gluten') && !option.tags.includes('soy')), true);
const veganTomorrow = api.pumpCatalogPersonalizedMenu({ ...base, id: 'vegan-1', personalization: veganNoGlutenSoy }, { calories: 1250, protein: 126 }, '2026-08-16');
assert.notDeepEqual(veganMenu.meals.map((meal) => meal.options[0].id), veganTomorrow.meals.map((meal) => meal.options[0].id), 'the primary menu rotates between days');

const previousLocalStorage = globalThis.localStorage;
globalThis.localStorage = { getItem: () => JSON.stringify({ plan: { snacks: 2 } }) };
const nativeMenu = api.pumpNativeMeals({ ...base, id: 'native-1', personalization: veganNoGlutenSoy }, { calories: 1600, protein: 126 }, '2026-08-15');
if (previousLocalStorage === undefined) delete globalThis.localStorage;
else globalThis.localStorage = previousLocalStorage;
assert.equal(nativeMenu.meals.reduce((sum, meal) => sum + meal.options[0].calories, 0), 1600, 'main meals and snacks divide the daily calorie target without adding calories');

const vegetarianNoDairy = {
  foodStyle: 'vegetarian', avoid: ['dairy'], proteins: ['eggs', 'plant'],
  favorites: [], dislikes: ['tuna'], prep: 'flexible', budget: 'regular', equipment: ['gym'],
  trainingFocus: 'lower', limitation: 'knee', sessionMinutes: '45'
};
const vegetarianMenu = api.pumpCatalogPersonalizedMenu({ ...base, id: 'vegetarian-1', mealPattern: 'two', personalization: vegetarianNoDairy }, { calories: 1400, protein: 126 }, '2026-08-15');
assert.equal(vegetarianMenu.meals.length, 2);
assert.equal(vegetarianMenu.meals.flatMap((meal) => meal.options).every((option) => !option.tags.includes('meat') && !option.tags.includes('fish') && !option.tags.includes('dairy') && !option.tags.includes('tuna')), true);
const kneeTraining = api.pumpPersonalizedTraining({ ...base, trainingPlace: 'gym', personalization: vegetarianNoDairy });
assert.match(kneeTraining.a.exercises[0].name, /ישבן · היפ תראסט במכונה/);
assert.equal(kneeTraining.a.exercises[0].detail.includes('3 סטים'), true);
assert.match(kneeTraining.progression, /עקביות/);

const shoulderTraining = api.pumpPersonalizedTraining({
  ...base,
  personalization: { ...veganNoGlutenSoy, equipment: ['bands'], trainingFocus: 'balanced', limitation: 'shoulder', sessionMinutes: '30' }
});
assert.match(shoulderTraining.b.exercises[2].name, /יציבה · קירוב שכמות עדין/);

const adaptiveProtein = api.pumpPersonalizedTargets({ ...base, activity: 'medium', trainingDays: 4, personalization: veganNoGlutenSoy });
assert.equal(adaptiveProtein.protein, 133);

const rejectedRecipe = api.pumpMealCatalog.find((recipe) => recipe.id === 'chicken-rice-tahini');
const feedbackMenu = api.pumpCatalogPersonalizedMenu({
  ...base,
  id: 'feedback-1',
  personalization: { foodStyle: 'regular', avoid: [], proteins: [], favorites: [], dislikes: [], prep: 'quick', budget: 'regular' },
  mealFeedback: [{ recipeId: rejectedRecipe.id, feedback: 'not_for_me' }],
}, { calories: 1250, protein: 126 }, '2026-08-15');
assert.equal(feedbackMenu.meals.flatMap((meal) => meal.options).some((option) => option.id === rejectedRecipe.id), false, 'negative meal feedback removes a recipe from future choices');

console.log('personalization helper matrix checks passed');
