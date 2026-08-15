import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bundle = await readFile(new URL('../assets/index-personalized-v2.js', import.meta.url), 'utf8');
const start = bundle.indexOf('function pumpPreferenceList');
const end = bundle.indexOf('function pumpNativeMeals', start);
assert.ok(start >= 0 && end > start, 'personalization helpers are present in the generated bundle');

const helpers = bundle.slice(start, end);
const Ma = () => ({ meals: [], snack: 'fallback snack', note: 'fallback note' });
const Na = () => ({ a: {}, b: {}, location: 'fallback', weekly: [] });
const ja = () => ({ calories: 1600, protein: 112 });
const api = new Function('Ma', 'Na', 'ja', `${helpers};return {pumpPersonalizedMenu,pumpPersonalizedSnacks,pumpPersonalizedTargets,pumpPersonalizedTraining};`)(Ma, Na, ja);

const base = {
  diet: '', goal: 'lose', startWeight: 70, targetWeight: 62,
  activity: 'light', trainingLevel: 'beginner', trainingPlace: 'home',
  trainingDays: 3, mealPattern: 'three'
};

const veganNoGlutenSoy = {
  foodStyle: 'vegan', avoid: ['gluten', 'soy'], proteins: ['plant'],
  prep: 'quick', budget: 'budget', equipment: ['dumbbells'],
  trainingFocus: 'upper', limitation: 'none', sessionMinutes: '20'
};
const veganMenu = api.pumpPersonalizedMenu({ ...base, personalization: veganNoGlutenSoy }, { calories: 1600, protein: 126 });
const veganOptions = veganMenu.meals.flatMap((meal) => meal.options);
assert.equal(veganOptions.length, 9);
assert.equal(veganOptions.every((option) => option.tags.includes('vegan') && !option.tags.includes('gluten') && !option.tags.includes('soy')), true);
assert.equal(veganOptions.every((option) => option.calories === 550), true);
const veganSnacks = api.pumpPersonalizedSnacks({ ...base, personalization: veganNoGlutenSoy }, [170, 250]);
assert.equal(veganSnacks.flatMap((meal) => meal.options).every((option) => option.tags.includes('vegan') && !option.tags.includes('gluten') && !option.tags.includes('soy')), true);

const vegetarianNoDairy = {
  foodStyle: 'vegetarian', avoid: ['dairy'], proteins: ['eggs', 'plant'],
  prep: 'flexible', budget: 'regular', equipment: ['gym'],
  trainingFocus: 'lower', limitation: 'knee', sessionMinutes: '45'
};
const vegetarianMenu = api.pumpPersonalizedMenu({ ...base, mealPattern: 'two', personalization: vegetarianNoDairy }, { calories: 1800, protein: 126 });
assert.equal(vegetarianMenu.meals.length, 2);
assert.equal(vegetarianMenu.meals.flatMap((meal) => meal.options).every((option) => !option.tags.includes('meat') && !option.tags.includes('fish') && !option.tags.includes('dairy')), true);
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

console.log('personalization helper matrix checks passed');
