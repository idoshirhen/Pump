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
const api = new Function('Ma', 'Na', 'ja', `${helpers};return {pumpOnboardingPreferences,pumpCatalogPersonalizedMenu,pumpCatalogPersonalizedSnacks,pumpCatalogDailyMenu,pumpCatalogProteinBoosters,pumpCatalogEnergyBoosters,pumpMealCatalog,pumpNativeMeals,pumpPersonalizedTargets,pumpPersonalizedTraining};`)(Ma, Na, ja);

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

function everyMenuCombination(meals, visit, index = 0, selected = []) {
  if (index === meals.length) {
    visit(selected);
    return;
  }
  for (const option of meals[index].options) everyMenuCombination(meals, visit, index + 1, [...selected, option]);
}

function assertTargetGuaranteed(menu, targets, label) {
  assert.equal(menu.guarantee.calories, targets.calories, `${label}: primary plan reaches the calorie target`);
  assert.equal(menu.guarantee.protein, targets.protein, `${label}: primary plan reaches the protein target`);
  let combinations = 0;
  everyMenuCombination(menu.meals, (selected) => {
    combinations += 1;
    assert.equal(selected.reduce((sum, option) => sum + option.calories, 0), targets.calories, `${label}: every alternative combination reaches calories`);
    assert.equal(selected.reduce((sum, option) => sum + option.proteinGrams, 0), targets.protein, `${label}: every alternative combination reaches protein`);
  });
  assert.ok(combinations >= 81, `${label}: checks every swap combination, not only the first option`);
}

function assertBoostersRespectPreferences(menu, preferences, label) {
  const boosters = [...api.pumpCatalogProteinBoosters, ...api.pumpCatalogEnergyBoosters];
  for (const meal of menu.meals) {
    for (const option of meal.options) {
      const recipe = api.pumpMealCatalog.find((entry) => entry.id === option.id);
      assert.ok(recipe, `${label}: catalog recipe exists for ${option.id}`);
      const baseScale = option.plannedBoosters?.baseScale;
      assert.equal(typeof baseScale, 'number', `${label}: base scale is retained for audit`);
      let computedCalories = recipe.calories * baseScale;
      let computedProtein = recipe.protein * baseScale;
      const planned = [option.plannedBoosters?.protein, ...(option.plannedBoosters?.energy ?? [])].filter(Boolean);
      for (const entry of planned) {
        const id = entry.id;
      const booster = boosters.find((entry) => entry.id === id);
      assert.ok(booster, `${label}: known booster ${id}`);
      assert.equal(booster.tags.some((tag) => preferences.avoid.includes(tag)), false, `${label}: booster ${id} avoids restricted ingredients`);
        if (option.plannedBoosters?.energy.some((energy) => energy.id === id)) assert.equal(booster.slots.includes(meal.slot), true, `${label}: energy booster ${id} fits its meal slot`);
      if (preferences.foodStyle === 'vegan') assert.equal(booster.tags.includes('vegan'), true, `${label}: booster ${id} is vegan`);
      if (preferences.foodStyle === 'vegetarian') {
        assert.equal(booster.tags.includes('meat') || booster.tags.includes('fish'), false, `${label}: booster ${id} is vegetarian`);
      }
        computedCalories += booster.caloriesPerGram * entry.grams;
        computedProtein += booster.proteinPerGram * entry.grams;
      }
      assert.ok(Math.abs(computedCalories - option.calories) <= 5, `${label}: displayed calories are backed by the displayed portions`);
      assert.ok(Math.abs(computedProtein - option.proteinGrams) <= 0.1, `${label}: displayed protein is backed by the displayed portions`);
    }
  }
}

const targetScenarios = [
  {
    label: 'four-meal high-calorie regular plan',
    profile: {
      ...base, id: 'target-regular', goal: 'gain', startWeight: 62, targetWeight: 66,
      personalization: { foodStyle: 'regular', avoid: [], proteins: ['chicken', 'fish'], favorites: ['rice'], dislikes: [], prep: 'quick', budget: 'regular' },
    },
    targets: { calories: 2800, protein: 112 }, snacks: 1, count: 4,
  },
  {
    label: 'four-meal very-high-calorie regular plan',
    profile: {
      ...base, id: 'target-regular-3000', goal: 'gain', startWeight: 62, targetWeight: 66,
      personalization: { foodStyle: 'regular', avoid: [], proteins: ['chicken', 'beef'], favorites: [], dislikes: [], prep: 'quick', budget: 'regular' },
    },
    targets: { calories: 3000, protein: 112 }, snacks: 1, count: 4,
  },
  {
    label: 'vegan gluten-free soy-free high-calorie plan',
    profile: { ...base, id: 'target-vegan', goal: 'gain', startWeight: 68, targetWeight: 72, personalization: veganNoGlutenSoy },
    targets: { calories: 2800, protein: 126 }, snacks: 1, count: 4,
  },
  {
    label: 'vegetarian dairy-free high-protein plan',
    profile: { ...base, id: 'target-vegetarian', mealPattern: 'two', personalization: vegetarianNoDairy },
    targets: { calories: 2400, protein: 140 }, snacks: 2, count: 4,
  },
  {
    label: 'automatic extra snack for a large target',
    profile: {
      ...base, id: 'target-extra-snack', goal: 'gain', startWeight: 75, targetWeight: 80,
      personalization: { foodStyle: 'regular', avoid: [], proteins: ['chicken'], favorites: [], dislikes: [], prep: 'quick', budget: 'regular' },
    },
    targets: { calories: 3300, protein: 130 }, snacks: 1, count: 5,
  },
];

const targetLocalStorage = globalThis.localStorage;
for (const scenario of targetScenarios) {
  globalThis.localStorage = { getItem: () => JSON.stringify({ plan: { snacks: scenario.snacks } }) };
  const menu = api.pumpNativeMeals(scenario.profile, scenario.targets, '2026-08-15');
  assert.equal(menu.meals.length, scenario.count, `${scenario.label}: correct meal count`);
  assertTargetGuaranteed(menu, scenario.targets, scenario.label);
  assertBoostersRespectPreferences(menu, scenario.profile.personalization, scenario.label);
}
if (targetLocalStorage === undefined) delete globalThis.localStorage;
else globalThis.localStorage = targetLocalStorage;

console.log('personalization helper matrix checks passed');
