import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleRoot = process.env.PUMP_TEST_NODE_MODULES || '/tmp/pump-personalization-test-deps/node_modules';
const { JSDOM } = await import(pathToFileURL(join(moduleRoot, 'jsdom/lib/api.js')).href);
const bundle = await readFile(new URL('../assets/index-personalized-v2.js', import.meta.url), 'utf8');
assert.match(bundle, /w\.age<18/, 'automatic calorie planning is guarded for minors');
assert.match(bundle, /w\.needsMedicalClearance/, 'automatic calorie planning is guarded for medical-clearance cases');
const wait = (milliseconds = 20) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, label) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
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
const mealFeedback = [];
let personalization = null;
let profileSaveCount = 0;
let personalizationSaveCount = 0;
const profile = {
  name: 'בדיקת PUMP', sex: 'female', age: 28, height: 165,
  start_weight: 70, target_weight: 62, activity: 'light', diet: '', goal: 'lose',
  pace: 'steady', training_level: 'beginner', training_place: 'home', training_days: 3,
  meal_pattern: 'three', sleep: 'sixToSeven', main_challenge: 'consistency',
  weekend_eating: false, needs_medical_clearance: false, onboarding_done: false,
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
    if (method === 'POST') {
      const payload = JSON.parse(init.body);
      Object.assign(profile, Array.isArray(payload) ? payload[0] : payload);
      profileSaveCount += 1;
      return response([profile], 201);
    }
    return response(objectResponse ? profile : [profile]);
  }
  if (url.pathname.endsWith('/rest/v1/user_personalization')) {
    if (method === 'POST') {
      const payload = JSON.parse(init.body);
      personalization = (Array.isArray(payload) ? payload[0] : payload).preferences;
      personalizationSaveCount += 1;
      return response([{ user_id: 'user-1', preferences: personalization }], 201);
    }
    const row = personalization ? { user_id: 'user-1', preferences: personalization } : null;
    return response(objectResponse ? row : row ? [row] : []);
  }
  if (url.pathname.endsWith('/rest/v1/user_meal_feedback')) {
    if (method === 'POST') {
      const row = Array.isArray(JSON.parse(init.body)) ? JSON.parse(init.body)[0] : JSON.parse(init.body);
      const old = mealFeedback.findIndex((item) => item.recipe_id === row.recipe_id);
      if (old >= 0) mealFeedback.splice(old, 1, row); else mealFeedback.push(row);
      return response([row], 201);
    }
    return response(mealFeedback);
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

window.eval(bundle);
await waitFor(() => window.document.querySelector('.onboarding'), 'first-time onboarding');
assert.equal(window.document.querySelector('.pump-personalization-card'), null, 'no persistent personalization card is mounted');
assert.match(window.document.querySelector('.onboarding-top span').textContent, /שלב 1 מתוך 8/);

const originalUrl = window.location.href;
const nextButton = () => window.document.querySelector('.onboard-footer .primary');
const currentStep = () => window.document.querySelector('.onboarding-top span').textContent.trim();
async function next(stepNumber) {
  nextButton().click();
  await waitFor(() => currentStep().includes(`שלב ${stepNumber} מתוך 8`), `onboarding step ${stepNumber}`);
}

function setInput(input, value) {
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function clickOnboardingChoice(text) {
  const button = [...window.document.querySelectorAll('.onboarding button')]
    .find((candidate) => candidate.textContent.includes(text));
  assert.ok(button, `choice exists: ${text}`);
  button.click();
}

await next(2);
setInput(window.document.querySelector('.onboarding input'), 'בדיקת PUMP');
await next(3);
await next(4);
await next(5);
await next(6);

clickOnboardingChoice('טבעוני/ת');
clickOnboardingChoice('גלוטן');
clickOnboardingChoice('סויה / טופו');
clickOnboardingChoice('חלבון צמחי');
clickOnboardingChoice('טחינה');
await next(7);

clickOnboardingChoice('משקולות יד');
clickOnboardingChoice('פלג גוף עליון');
clickOnboardingChoice('20 דקות');
await next(8);
assert.equal(nextButton().textContent.includes('אישור המסלול'), true, 'the final confirmation comes after preferences');
nextButton().click();

await waitFor(() => profile.onboarding_done === true, 'profile completion save');
await waitFor(() => personalization?.foodStyle === 'vegan', 'onboarding preference save');
await waitFor(() => window.document.querySelector('.bottom-nav'), 'signed-in application after onboarding');
assert.equal(profileSaveCount, 1, 'profile is saved once at onboarding completion');
assert.equal(personalizationSaveCount, 1, 'preferences are saved once at onboarding completion');
assert.equal(window.location.href, originalUrl, 'completing onboarding does not navigate or reload');
assert.deepEqual(personalization.avoid.sort(), ['gluten', 'soy']);
assert.equal(personalization.equipment.includes('dumbbells'), true);
assert.equal(personalization.trainingFocus, 'upper');
assert.equal(personalization.sessionMinutes, '20');
assert.equal(personalization.favorites.includes('tahini'), true);
assert.equal(window.document.querySelector('.pump-personalization-card'), null, 'home stays free of a personalization card');

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
assert.ok(snackCard.querySelector('.meal-feedback'), 'a completed snack has the same feedback controls as every meal');
const likedButton = [...snackCard.querySelectorAll('.meal-feedback button')].find((button) => button.textContent.includes('אהבתי'));
assert.ok(likedButton, 'meal feedback includes a like action');
likedButton.click();
await waitFor(() => mealFeedback.length === 1, 'meal feedback persistence');
await waitFor(() => [...window.document.querySelectorAll('.menu-list > article')][3].querySelector('.meal-feedback button.active'), 'meal feedback UI update');
assert.equal(mealFeedback[0].feedback, 'liked');
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
console.log('personalization onboarding app flow checks passed');
