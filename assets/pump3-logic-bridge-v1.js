/* PUMP 3 logic bridge for the legacy PUMP UI.
   Contract: logic/data only. No styles, no root replacement, no layout creation. */
import { normalizePersonalizationProfile } from '/Pump/pump3/src/personalization/profile.js';
import { calculatePersonalizedTargets } from '/Pump/pump3/src/personalization/targets.js';
import { buildMealFeedbackModel, mealAllowedForProfile, scoreMealForProfile } from '/Pump/pump3/src/personalization/meal-preferences.js';
import { createTrainingPrescription } from '/Pump/pump3/src/personalization/training-prescription.js';
import { mealsForSlot, materializeMealTemplate } from '/Pump/pump3/src/nutrition/data/meal-catalog.js';
import { targetMealNutrition } from '/Pump/pump3/src/nutrition/engine/meal-targeting.js';
import { buildWorkoutPlan } from '/Pump/pump3/src/training/engine/workout-engine.js';
import { EXERCISE_BY_ID } from '/Pump/pump3/src/training/data/exercise-catalog.js';
import { instructionForExercise } from '/Pump/pump3/src/training/data/exercise-instructions.js';

const VERSION = 'logic-bridge-v1';
const SUPABASE_URL = 'https://aebysqjymsjepvslidjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';
const AUTH_KEY = 'sb-aebysqjymsjepvslidjl-auth-token';
const nativeFetch = window.__PUMP_NATIVE_FETCH || window.fetch.bind(window);
let bridgeContext = null;
let refreshTimer = null;
let patchFrame = 0;

function dateKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).format(new Date());
}

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token) return parsed;
    if (parsed?.currentSession?.access_token) return parsed.currentSession;
    if (parsed?.session?.access_token) return parsed.session;
  } catch (_) {}
  return null;
}

async function rest(path, { method = 'GET', body = null, prefer = null } = {}) {
  const session = getSession();
  if (!session?.access_token) throw new Error('no-auth-session');
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const response = await nativeFetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`supabase-${response.status}`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function dietFromLegacy(profile, personalization) {
  const foodStyle = String(personalization?.foodStyle ?? '').toLowerCase();
  const dietText = String(profile?.diet ?? '').toLowerCase();
  if (foodStyle === 'vegan' || /טבעונ/.test(dietText)) return 'vegan';
  if (foodStyle === 'vegetarian' || /צמחונ/.test(dietText)) return 'vegetarian';
  return 'omnivore';
}

function legacyToPump3(profile, personalization, latestWeight, mealFeedback) {
  const goal = profile.goal === 'event'
    ? (Number(profile.target_weight) > latestWeight ? 'gain' : 'lose')
    : (profile.goal === 'gain' ? 'gain' : profile.goal === 'lose' ? 'lose' : 'maintain');
  const activity = ({ low: 'sedentary', light: 'light', medium: 'medium', high: 'high' })[profile.activity] ?? 'light';
  const trainingLevel = ({ beginner: 'beginner', returning: 'intermediate', experienced: 'advanced' })[profile.training_level] ?? 'beginner';
  const equipment = Array.isArray(personalization?.equipment) ? personalization.equipment : [];
  const trainingPlace = profile.training_place === 'gym'
    ? 'gym'
    : profile.training_place === 'both'
      ? (equipment.includes('gym') ? 'gym' : 'home')
      : 'home';
  const targetWeight = Number(profile.target_weight ?? latestWeight);
  const normalizedTarget = goal === 'lose' ? Math.min(targetWeight, latestWeight) : goal === 'gain' ? Math.max(targetWeight, latestWeight) : latestWeight;
  return normalizePersonalizationProfile({
    id: profile.id,
    sex: profile.sex,
    age: profile.age,
    height: profile.height,
    startWeight: latestWeight,
    targetWeight: normalizedTarget,
    goal,
    activity,
    diet: dietFromLegacy(profile, personalization),
    trainingLevel,
    trainingPlace,
    trainingDays: Math.max(2, Math.min(6, Number(profile.training_days || 2))),
    personalization: {
      ...personalization,
      foodStyle: dietFromLegacy(profile, personalization),
      sessionMinutes: Number(personalization?.sessionMinutes || 30),
      trainingFocus: personalization?.trainingFocus || 'balanced',
      limitation: personalization?.limitation || 'none',
      equipment: equipment.length ? equipment : (trainingPlace === 'gym' ? ['gym', 'bodyweight'] : ['bodyweight']),
    },
    mealFeedback,
  });
}

function stableHash(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function feedbackModel(profile) {
  return buildMealFeedbackModel(profile.mealFeedback);
}

function plannerDiet(profile) {
  return profile.diet === 'vegetarian' ? 'omnivore' : profile.diet;
}

function safeTemplates(slot, profile, feedback) {
  return mealsForSlot(slot, { diet: plannerDiet(profile) })
    .filter((template) => mealAllowedForProfile(template, profile, feedback))
    .sort((a, b) => scoreMealForProfile(b, profile, feedback) - scoreMealForProfile(a, profile, feedback) || a.id.localeCompare(b.id));
}

function scaleSplit(mainCount, snackCount) {
  const snackShare = snackCount <= 0 ? 0 : snackCount === 1 ? 0.12 : snackCount === 2 ? 0.18 : 0.24;
  const mainBase = mainCount === 2 ? [0.40, 0.60] : [0.24, 0.39, 0.37];
  const mainScale = 1 - snackShare;
  const mains = mainBase.map((x) => x * mainScale);
  const snacks = snackCount ? Array.from({ length: snackCount }, () => snackShare / snackCount) : [];
  return { mains, snacks };
}

function slotForVisualIndex(index, mainCount) {
  if (index >= mainCount) return 'snack';
  if (mainCount === 2) return index === 0 ? 'breakfast' : 'lunch';
  return ['breakfast', 'lunch', 'dinner'][index] ?? 'snack';
}

function targetMealOption(template, targetCalories, targetProtein) {
  const materialized = materializeMealTemplate(template);
  const result = targetMealNutrition(materialized.items, { calories: targetCalories, protein: targetProtein }, {
    calorieTolerance: 35,
    proteinTolerance: 4,
  });
  const totals = result.meal.totals;
  return {
    id: template.id,
    title: template.title,
    detail: `כמות: ${result.items.map((item) => `${Math.round(item.grams)} גרם ${item.food.name}`).join(' · ')}`,
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  };
}

function buildLegacyMealPlan(profile, targets, mainCount, visibleCount) {
  const feedback = feedbackModel(profile);
  const snackCount = Math.max(0, visibleCount - mainCount);
  const split = scaleSplit(mainCount, snackCount);
  const seed = stableHash(`${profile.id}:${dateKey()}`);
  const used = new Set();
  const cards = [];

  for (let index = 0; index < visibleCount; index += 1) {
    const slot = slotForVisualIndex(index, mainCount);
    const share = index < mainCount ? split.mains[index] : split.snacks[index - mainCount];
    const targetCalories = Math.max(120, targets.calories * share);
    const targetProtein = Math.max(8, targets.protein * share);
    const templates = safeTemplates(slot, profile, feedback);
    if (!templates.length) continue;
    const rotated = templates.slice(seed % templates.length).concat(templates.slice(0, seed % templates.length));
    const ordered = [...rotated.filter((x) => !used.has(x.id)), ...rotated.filter((x) => used.has(x.id))];
    const options = ordered.slice(0, Math.min(3, ordered.length)).map((template) => targetMealOption(template, targetCalories, targetProtein));
    options.forEach((option) => used.add(option.id));
    cards.push({ slot, options });
  }
  return cards;
}

function visualTrainingPrescription(profile) {
  const base = createTrainingPrescription(profile);
  return Object.freeze({
    ...base,
    split: Object.freeze(['full-body-a', 'full-body-b']),
    maxExercisesPerSession: Math.min(4, base.maxExercisesPerSession),
  });
}

function buildLegacyTraining(profile) {
  const prescription = visualTrainingPrescription(profile);
  return buildWorkoutPlan(prescription, { seed: stableHash(`${profile.id}:${dateKey()}:training`), sex: profile.sex });
}

function parseOptionIndex(card) {
  const text = card.querySelector('.menu-meta span')?.textContent ?? '';
  const match = text.match(/חלופה\s+(\d+)/);
  return Math.max(0, Number(match?.[1] ?? 1) - 1);
}

function patchTargetText(targets) {
  const nodes = document.querySelectorAll('.daily-head b, .nutrition-target b');
  nodes.forEach((node, index) => {
    const text = node.textContent || '';
    if (!/\//.test(text)) return;
    const before = text.split('/')[0].trim();
    const target = index % 2 === 1 && /חלבון|גרם/.test(node.parentElement?.textContent ?? '') ? Math.round(targets.protein) : Math.round(targets.calories);
    const unit = /גרם/.test(text) ? ' גרם' : /קל/.test(text) ? ' קל׳' : '';
    node.textContent = `${before} / ${target.toLocaleString('he-IL')}${unit}`;
  });
}

function patchMealCards(context) {
  const cards = [...document.querySelectorAll('.menu-list > article')];
  if (!cards.length) return;
  const mainCount = context.legacyProfile.meal_pattern === 'two' ? 2 : 3;
  if (!context.mealPlan || context.mealPlan.length !== cards.length) context.mealPlan = buildLegacyMealPlan(context.profile, context.targets, mainCount, cards.length);
  cards.forEach((card, index) => {
    const plan = context.mealPlan[index];
    if (!plan?.options?.length) return;
    const optionIndex = Math.min(parseOptionIndex(card), plan.options.length - 1);
    const option = plan.options[optionIndex];
    const title = card.querySelector('h3');
    const detail = card.querySelector('h3 + p');
    const macro = card.querySelector('h3 + p + small');
    const optionCount = card.querySelector('.menu-meta span');
    if (!title || !detail || !macro) return;
    title.textContent = option.title;
    detail.textContent = option.detail;
    macro.textContent = `${option.protein} גרם חלבון · ${option.calories.toLocaleString('he-IL')} קל׳`;
    if (optionCount) optionCount.textContent = `חלופה ${optionIndex + 1} מתוך ${plan.options.length}`;
    card.dataset.pump3MealId = option.id;
    card.dataset.pump3Title = option.title;
    card.dataset.pump3Calories = String(option.calories);
    card.dataset.pump3Protein = String(option.protein);
    card.dataset.pump3Carbs = String(option.carbs);
    card.dataset.pump3Fat = String(option.fat);
    card.dataset.pumpNutritionSignature = `${option.title}|${option.detail}|${macro.textContent}`;
  });
}

function setTextBySelectors(container, selectors, value) {
  for (const selector of selectors) {
    const node = container.querySelector(selector);
    if (node) { node.textContent = value; return true; }
  }
  return false;
}

function patchTrainingCards(context) {
  const cards = [...document.querySelectorAll('.workout-card')].slice(0, 2);
  if (!cards.length || !context.training?.sessions?.length) return;
  cards.forEach((card, sessionIndex) => {
    const session = context.training.sessions[sessionIndex];
    if (!session) return;
    const rows = [...card.querySelectorAll('.exercise-list > article')];
    rows.forEach((row, index) => {
      const planned = session.exercises[index];
      if (!planned) return;
      const exercise = EXERCISE_BY_ID[planned.exerciseId];
      if (!exercise) return;
      const copy = row.querySelector('div');
      if (!copy) return;
      const p = planned.prescription;
      const prescriptionText = p.mode === 'seconds'
        ? `${p.sets} סטים · ${p.secondsRange?.[0] ?? 20}–${p.secondsRange?.[1] ?? 40} שנ׳ · מנוחה ${p.restSeconds} שנ׳`
        : `${p.sets} סטים של ${p.repRange?.[0] ?? 8}–${p.repRange?.[1] ?? 12} · מנוחה ${p.restSeconds} שנ׳`;
      const cues = instructionForExercise(planned.exerciseId)?.he ?? [];
      const alternative = planned.alternatives?.[0] ? EXERCISE_BY_ID[planned.alternatives[0]] : null;
      setTextBySelectors(copy, ['b'], exercise.names.he);
      setTextBySelectors(copy, ['small'], prescriptionText);
      const why = copy.querySelector('p');
      if (why) why.textContent = cues[0] ? `למה: ${cues[0]}` : 'למה: תרגיל שנבחר לפי המסלול והציוד שלך.';
      const alt = copy.querySelector('em');
      if (alt) alt.textContent = `חלופה: ${alternative?.names?.he ?? 'אין צורך להחליף כרגע'}`;
      row.dataset.pump3ExerciseId = planned.exerciseId;
    });
  });
}

function patchNow() {
  if (!bridgeContext) return;
  patchTargetText(bridgeContext.targets);
  patchMealCards(bridgeContext);
  patchTrainingCards(bridgeContext);
}

function schedulePatch() {
  cancelAnimationFrame(patchFrame);
  patchFrame = requestAnimationFrame(patchNow);
}

async function loadContext() {
  const session = getSession();
  if (!session?.user?.id && !session?.access_token) return null;
  const userId = session.user?.id;
  if (!userId) return null;
  const [profiles, personalRows, weights, feedbackRows] = await Promise.all([
    rest(`profiles?id=eq.${encodeURIComponent(userId)}&select=*`),
    rest(`user_personalization?user_id=eq.${encodeURIComponent(userId)}&select=preferences`),
    rest(`weight_entries?user_id=eq.${encodeURIComponent(userId)}&select=weight,date&order=date.desc&limit=1`),
    rest(`user_meal_feedback?user_id=eq.${encodeURIComponent(userId)}&select=recipe_id,feedback,updated_at`),
  ]);
  const legacyProfile = profiles?.[0];
  if (!legacyProfile?.onboarding_done) return null;
  const personalization = personalRows?.[0]?.preferences ?? {};
  const latestWeight = Number(weights?.[0]?.weight ?? legacyProfile.start_weight);
  const mealFeedback = (feedbackRows ?? []).map((row) => ({ recipeId: row.recipe_id, feedback: row.feedback, updatedAt: row.updated_at }));
  const profile = legacyToPump3(legacyProfile, personalization, latestWeight, mealFeedback);
  const targets = calculatePersonalizedTargets(profile);
  const training = Number(legacyProfile.training_days || 0) > 0 ? buildLegacyTraining(profile) : null;
  return { legacyProfile, profile, targets, training, mealPlan: null };
}

async function refresh() {
  try {
    const next = await loadContext();
    bridgeContext = next;
    window.PUMP3_LOGIC = { ...(window.PUMP3_LOGIC ?? {}), status: next ? 'ready' : 'idle', version: VERSION, context: next, refresh };
    schedulePatch();
  } catch (error) {
    window.PUMP3_LOGIC = { ...(window.PUMP3_LOGIC ?? {}), status: 'error', version: VERSION, error: String(error?.message ?? error), refresh };
  }
}

const previousFetch = window.fetch.bind(window);
window.fetch = async function pump3Fetch(input, init) {
  try {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
    if (/\/rest\/v1\/food_entries(?:\?|$)/.test(url) && method === 'POST' && typeof init?.body === 'string') {
      const parsed = JSON.parse(init.body);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      let managed = false;
      for (const row of rows) {
        if (!row?.menu_key) continue;
        const match = /^menu-(\d+)$/.exec(row.menu_key);
        if (!match) continue;
        const card = document.querySelectorAll('.menu-list > article')[Number(match[1])];
        if (!card?.dataset?.pump3MealId) continue;
        row.name = card.dataset.pump3Title;
        row.calories = Number(card.dataset.pump3Calories || 0);
        row.protein = Number(card.dataset.pump3Protein || 0);
        row.carbs = Number(card.dataset.pump3Carbs || 0);
        row.fat = Number(card.dataset.pump3Fat || 0);
        managed = true;
      }
      if (managed) {
        const nextInit = { ...init, body: JSON.stringify(Array.isArray(parsed) ? rows : rows[0]) };
        return nativeFetch(input, nextInit);
      }
    }
  } catch (_) {}
  return previousFetch(input, init);
};

function feedbackValue(text) {
  const value = String(text || '').trim();
  if (value.includes('אהבתי')) return 'liked';
  if (value.includes('לא רוצה')) return 'not_for_me';
  if (value.includes('יקר')) return 'too_expensive';
  if (value.includes('מסובך') || value.includes('לקח זמן')) return 'too_slow';
  if (value.includes('לא השביע')) return 'still_hungry';
  return null;
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('.meal-feedback button');
  if (!button) return;
  const card = button.closest('.menu-list > article');
  const recipeId = card?.dataset?.pump3MealId;
  const feedback = feedbackValue(button.textContent);
  const session = getSession();
  if (!recipeId || !feedback || !session?.user?.id) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  try {
    await rest('user_meal_feedback?on_conflict=user_id,recipe_id', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: { user_id: session.user.id, recipe_id: recipeId, feedback, updated_at: new Date().toISOString() },
    });
    await refresh();
  } catch (_) {}
}, true);

const observer = new MutationObserver(schedulePatch);
const start = () => {
  observer.observe(document.documentElement, { childList: true, subtree: true });
  refresh();
  refreshTimer = window.setInterval(refresh, 30000);
  window.addEventListener('focus', refresh);
  window.addEventListener('pump-personalization:updated', refresh);
};

window.PUMP3_LOGIC = { status: 'booting', version: VERSION, refresh };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
