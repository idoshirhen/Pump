import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNutritionPlan, resolveMealStructure } from '../src/domain/nutrition.js';
import { createNutritionRepository } from '../src/data/nutritionRepository.js';
import { createNutritionController } from '../src/nutrition/controller.js';
import { nutritionMarkup } from '../src/nutrition/view.js';
import { calculateNutritionTargets } from '../src/domain/targets.js';
import { createSupabaseRestClient, getStoredSession } from '../src/data/supabaseRestClient.js';

test('three meals plus one snack equals the daily calorie and protein targets', () => {
  const plan = buildNutritionPlan({ calories: 2000, protein: 120, diet: 'רגיל', mealPattern: 'three' });
  assert.equal(plan.meals.length, 4);
  assert.equal(plan.meals.filter((meal) => meal.kind === 'snack').length, 1);
  assert.equal(plan.meals.reduce((sum, meal) => sum + meal.calories, 0), 2000);
  assert.equal(plan.meals.reduce((sum, meal) => sum + meal.protein, 0), 120);
});

test('two meals get two snack meals and still equal the targets', () => {
  const plan = buildNutritionPlan({ calories: 2400, protein: 140, diet: 'רגיל', mealPattern: 'two' });
  assert.equal(plan.meals.length, 4);
  assert.equal(plan.meals.filter((meal) => meal.kind === 'main').length, 2);
  assert.equal(plan.meals.filter((meal) => meal.kind === 'snack').length, 2);
  assert.equal(plan.meals.reduce((sum, meal) => sum + meal.calories, 0), 2400);
});

test('vegan choices do not contain dairy meal names', () => {
  const plan = buildNutritionPlan({ calories: 2100, protein: 110, diet: 'טבעוני', mealPattern: 'flexible' });
  assert.equal(plan.meals.length, 5);
  assert.ok(plan.meals.every((meal) => meal.options.every((option) => !/סקיר|יוגורט PRO|קוטג׳/i.test(option.title))));
});

test('meal structure is controlled by the recommendation, not a manual number', () => {
  assert.deepEqual(resolveMealStructure({ mealPattern: 'three' }), { mainMeals: 3, snacks: 1 });
  assert.deepEqual(resolveMealStructure({ mealPattern: 'two' }), { mainMeals: 2, snacks: 2 });
  assert.deepEqual(resolveMealStructure({ mealPattern: 'flexible' }), { mainMeals: 3, snacks: 2 });
});

test('marking a snack replaces only its prior entry and records a completed action', async () => {
  const calls = [];
  const repository = createNutritionRepository({
    clock: () => new Date('2026-08-13T12:00:00'),
    request: async (path, init = {}) => { calls.push({ path, init }); return path === 'food_entries' ? [{ id: 'entry-1' }] : []; }
  });
  await repository.markEaten({
    userId: 'user-1',
    meal: { id: 'snack-0', calories: 170, protein: 18 },
    optionIndex: 1,
    option: { title: 'כריך קטן עם חלבון' }
  });
  assert.match(calls[0].path, /menu_key=eq\.nutrition-v2-snack-0/);
  assert.equal(calls[0].init.method, 'DELETE');
  assert.deepEqual(calls[1].init.body, { user_id: 'user-1', date: '2026-08-13', menu_key: 'nutrition-v2-snack-0', name: 'כריך קטן עם חלבון', calories: 170, protein: 18 });
  assert.equal(calls[2].init.body.status, 'done');
});

test('undo deletes the exact food entry and its action', async () => {
  const calls = [];
  const repository = createNutritionRepository({ clock: () => new Date('2026-08-13T12:00:00'), request: async (path, init = {}) => { calls.push({ path, init }); return []; } });
  await repository.undo({ userId: 'user-1', mealId: 'snack-1', entryId: 'entry-2' });
  assert.deepEqual(calls.map((call) => call.path), ['food_entries?id=eq.entry-2', 'meal_actions?user_id=eq.user-1&date=eq.2026-08-13&meal_key=eq.nutrition-v2-snack-1']);
});

test('a snack swaps, saves, contributes to the summary, then can be undone', async () => {
  const saved = [];
  const repository = {
    saveChoice: async ({ mealId, optionIndex }) => saved.push(['choice', mealId, optionIndex]),
    markEaten: async ({ meal, optionIndex, option }) => { saved.push(['eat', meal.id, optionIndex, option.title]); return { id: 'entry-snack', calories: meal.calories, protein: meal.protein }; },
    undo: async ({ mealId, entryId }) => saved.push(['undo', mealId, entryId])
  };
  const plan = buildNutritionPlan({ calories: 2000, protein: 120, diet: 'רגיל', mealPattern: 'three' });
  const controller = createNutritionController({ plan, repository, userId: 'user-1' });
  let screen = await controller.swap('snack-0');
  assert.equal(screen.meals.find((meal) => meal.id === 'snack-0').optionIndex, 1);
  screen = await controller.eat('snack-0');
  assert.equal(screen.eatenCalories, 170);
  assert.equal(screen.eatenProtein, 18);
  assert.equal(screen.meals.find((meal) => meal.id === 'snack-0').done, true);
  screen = await controller.undo('snack-0');
  assert.equal(screen.eatenCalories, 0);
  assert.deepEqual(saved.map((item) => item[0]), ['choice', 'eat', 'undo']);
});

test('nutrition view renders snack meals with the same actions as main meals', () => {
  const plan = buildNutritionPlan({ calories: 2000, protein: 120, diet: 'רגיל', mealPattern: 'three' });
  const screen = createNutritionController({ plan, repository: { saveChoice() {}, markEaten() {}, undo() {} }, userId: 'user-1' }).view();
  const markup = nutritionMarkup(screen);
  assert.match(markup, /ארוחת ביניים 1/);
  assert.match(markup, /data-action="swap" data-meal-id="snack-0"/);
  assert.match(markup, /data-action="eat" data-meal-id="snack-0"/);
  assert.match(markup, /4 ארוחות סומנו/);
});

test('personal target is calculated from the stored profile before the plan is built', () => {
  const targets = calculateNutritionTargets({ start_weight: 70, target_weight: 65, height: 175, age: 30, sex: 'male', activity: 'light', goal: 'lose', pace: 'steady', training_level: 'beginner' });
  assert.equal(targets.calories, 1900);
  assert.equal(targets.protein, 112);
  const plan = buildNutritionPlan({ ...targets, mealPattern: 'two', diet: 'רגיל' });
  assert.equal(plan.meals.reduce((sum, meal) => sum + meal.calories, 0), targets.calories);
});

test('Supabase client sends the authenticated session and serializes a food entry', async () => {
  const calls = [];
  const client = createSupabaseRestClient({
    url: 'https://project.supabase.co', publishableKey: 'public-key',
    getSession: () => ({ access_token: 'token', user: { id: 'user-1' } }),
    fetchImpl: async (url, init) => { calls.push({ url, init }); return { ok: true, status: 201, json: async () => [] }; }
  });
  await client.request('food_entries', { method: 'POST', body: { name: 'סקיר', calories: 170 } });
  assert.equal(calls[0].url, 'https://project.supabase.co/rest/v1/food_entries');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer token');
  assert.equal(calls[0].init.body, '{"name":"סקיר","calories":170}');
});

test('stored session ignores malformed records and finds the Supabase session', () => {
  const values = { broken: '{', 'sb-project-auth-token': JSON.stringify({ currentSession: { access_token: 'token', user: { id: 'user-1' } } }) };
  const storage = { length: 2, key: (index) => index === 0 ? 'broken' : 'sb-project-auth-token', getItem: (key) => values[key] };
  assert.equal(getStoredSession(storage).user.id, 'user-1');
});
