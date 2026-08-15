import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleRoot = process.env.PUMP_TEST_NODE_MODULES || '/tmp/pump-personalization-test-deps/node_modules';
const { JSDOM } = await import(pathToFileURL(join(moduleRoot, 'jsdom/lib/api.js')).href);
const bundle = await readFile(new URL('../assets/index-personalized-v2.js', import.meta.url), 'utf8');
const personalizationUi = await readFile(new URL('../assets/pump-personalization-v2.js', import.meta.url), 'utf8');
const wait = (milliseconds = 20) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, label) {
  for (let attempt = 0; attempt < 140; attempt += 1) {
    if (check()) return;
    await wait();
  }
  throw new Error(`Timed out: ${label}`);
}

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

const foods = [];
const actions = [];
let personalization = null;
let updateEvents = 0;
const profile = {
  name: 'בדיקת PUMP', sex: 'female', age: 28, height: 165,
  start_weight: 70, target_weight: 62, activity: 'light', diet: '', goal: 'lose',
  pace: 'steady', training_level: 'beginner', training_place: 'home', training_days: 3,
  meal_pattern: 'three', sleep: 'sixToSeven', main_challenge: 'consistency',
  weekend_eating: false, needs_medical_clearance: false, onboarding_done: true,
};

const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  url: 'https://pump.test/Pump/', runScripts: 'dangerously', pretendToBeVisual: true,
});
const { window } = dom;
const pageErrors = [];
window.addEventListener('error', (event) => pageErrors.push(event.error || event.message));
window.Headers = Headers;
window.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  const method = String(init.method || 'GET').toUpperCase();
  const accept = new Headers(init.headers || {}).get('accept') || '';
  const objectResponse = accept.includes('vnd.pgrst.object');
  if (url.pathname.endsWith('/auth/v1/user')) return response({ id: 'user-1', email: 'test@pump.local' });
  if (url.pathname.endsWith('/rest/v1/profiles')) {
    return response(objectResponse ? profile : [profile]);
  }
  if (url.pathname.endsWith('/rest/v1/user_personalization')) {
    if (method === 'POST') {
      personalization = JSON.parse(init.body).preferences;
      return response([{ user_id: 'user-1', preferences: personalization }], 201);
    }
    const row = personalization ? { user_id: 'user-1', preferences: personalization } : null;
    return response(objectResponse ? row : row ? [row] : []);
  }
  if (url.pathname.endsWith('/rest/v1/weight_entries')) return response([]);
  if (url.pathname.endsWith('/rest/v1/checkins')) return response([]);
  if (url.pathname.endsWith('/rest/v1/food_entries')) {
    if (method === 'GET') return response(foods);
    if (method === 'POST') {
      const row = { id: `food-${foods.length + 1}`, ...JSON.parse(init.body) };
      const old = foods.findIndex((food) => food.menu_key === row.menu_key);
      if (old >= 0) foods.splice(old, 1, row); else foods.push(row);
      return response([row], 201);
    }
    if (method === 'DELETE') {
      const id = url.searchParams.get('id')?.replace('eq.', '');
      const key = url.searchParams.get('menu_key')?.replace('eq.', '');
      for (let index = foods.length - 1; index >= 0; index -= 1) {
        if ((id && foods[index].id === id) || (key && foods[index].menu_key === key)) foods.splice(index, 1);
      }
      return response([]);
    }
  }
  if (url.pathname.endsWith('/rest/v1/meal_actions')) {
    if (method === 'GET') return response(actions);
    if (method === 'POST') {
      const row = JSON.parse(init.body);
      const old = actions.findIndex((action) => action.meal_key === row.meal_key);
      if (old >= 0) actions.splice(old, 1, row); else actions.push(row);
      return response([row], 201);
    }
    if (method === 'DELETE') {
      const key = url.searchParams.get('meal_key')?.replace('eq.', '');
      const old = actions.findIndex((action) => action.meal_key === key);
      if (old >= 0) actions.splice(old, 1);
      return response([]);
    }
  }
  throw new Error(`Unexpected Supabase request: ${method} ${url}`);
};

window.localStorage.setItem('pump-meal-structure-v1', JSON.stringify({ plan: { snacks: 2 } }));
window.localStorage.setItem('sb-aebysqjymsjepvslidjl-auth-token', JSON.stringify({
  access_token: 'test-token', refresh_token: 'test-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'user-1', email: 'test@pump.local' },
}));
window.skippedMealCount = 0;
window.addEventListener('pump-personalization:updated', () => { updateEvents += 1; });

window.eval(bundle);
await waitFor(() => window.document.querySelector('.bottom-nav'), 'signed-in application');
window.eval(personalizationUi);
await waitFor(() => window.document.querySelector('.pump-personalization-card'), 'personalization card');

const originalUrl = window.location.href;
window.document.querySelector('.pump-personalization-open').click();
await waitFor(() => window.document.querySelector('.pump-personalization-modal'), 'personalization modal');

function clickChoice(text) {
  const button = [...window.document.querySelectorAll('.pump-personalization-choices button')]
    .find((candidate) => candidate.textContent.trim() === text);
  assert.ok(button, `choice exists: ${text}`);
  button.click();
}

clickChoice('טבעוני/ת');
clickChoice('גלוטן');
clickChoice('סויה / טופו');
clickChoice('חלבון צמחי');
clickChoice('משקולות יד');
clickChoice('פלג גוף עליון');
clickChoice('20 דקות');
window.document.querySelector('.pump-personalization-modal').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await waitFor(() => personalization?.foodStyle === 'vegan', 'preference save');
await waitFor(() => !window.document.querySelector('.pump-personalization-modal'), 'modal closes after save');
assert.equal(window.location.href, originalUrl, 'saving preferences does not navigate or reload');
assert.equal(updateEvents, 1, 'one native update event is emitted');
assert.deepEqual(personalization.avoid.sort(), ['gluten', 'soy']);
assert.equal(personalization.equipment.includes('dumbbells'), true);
assert.equal(personalization.trainingFocus, 'upper');
assert.equal(personalization.sessionMinutes, '20');

const foodTab = [...window.document.querySelectorAll('.bottom-nav button')].find((button) => button.textContent.includes('תזונה'));
foodTab.click();
await waitFor(() => window.document.querySelectorAll('.menu-list > article').length === 5, 'personalized native menu');
const mealCards = [...window.document.querySelectorAll('.menu-list > article')];
const visibleFood = mealCards.map((card) => card.textContent).join(' ');
assert.equal(/עוף|קוטג׳|טונה|ביצה|טופו|סקיר|פסטה/.test(visibleFood), false, 'vegan gluten-free soy-free choices exclude restricted foods');
assert.equal(window.document.querySelector('.menu-title b').textContent.trim(), '5 ארוחות', 'native menu includes snack meals');

let snackCard = [...window.document.querySelectorAll('.menu-list > article')][3];
snackCard.querySelector('.meal-toggle').click();
await waitFor(() => [...window.document.querySelectorAll('.menu-list > article')][3].classList.contains('meal-done'), 'native snack completion');
assert.equal(foods.length, 1);
assert.equal(foods[0].menu_key, 'menu-3');
assert.equal(window.document.querySelector('.logged-food').textContent.includes(foods[0].name), true);
snackCard = [...window.document.querySelectorAll('.menu-list > article')][3];
snackCard.querySelector('.meal-toggle.done').click();
await waitFor(() => foods.length === 0, 'native snack cancellation');
assert.equal(window.location.href, originalUrl, 'meal changes do not navigate or reload');

const trainingTab = [...window.document.querySelectorAll('.bottom-nav button')].find((button) => button.textContent.includes('כושר'));
trainingTab.click();
await waitFor(() => window.document.querySelector('.exercise-list'), 'personalized training screen');
const firstExercise = window.document.querySelector('.exercise-list article b').textContent;
assert.match(firstExercise, /חזה · לחיצת חזה עם משקולות/, 'upper-body preference and dumbbells change exercise selection');
assert.equal(window.document.querySelector('.exercise-list article small').textContent.includes('2 סטים'), true, 'session length changes volume');
assert.equal(pageErrors.length, 0, `page errors: ${pageErrors.join(', ')}`);

window.close();
console.log('personalization app flow checks passed');
