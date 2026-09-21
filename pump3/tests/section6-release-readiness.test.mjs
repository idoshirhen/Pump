import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildPersonalizedPlan } from '../src/personalization/engine.js';
import { planDailyNutrition } from '../src/nutrition/engine/day-planner.js';

for (const path of [
  'pump3/src/services/mealFeedbackStore.js',
  'pump3/src/app/useMealFeedback.js',
  'supabase/migrations/20260922003000_add_pump3_profiles.sql',
  'supabase/migrations/20260922005000_add_pump3_daily_state.sql',
  'supabase/migrations/20260922013000_add_pump3_manual_foods.sql',
  '.github/workflows/deploy-pump3-pages.yml',
]) assert.ok(fs.existsSync(path), `missing release artifact: ${path}`);

const vite = fs.readFileSync('pump3/vite.config.js', 'utf8');
assert.match(vite, /base:\s*['"]\/Pump\/['"]/);

const supabase = fs.readFileSync('pump3/src/services/supabase.js', 'utf8');
assert.match(supabase, /DEFAULT_SUPABASE_URL/);
assert.match(supabase, /sb_publishable_/);
assert.match(supabase, /persistSession:\s*true/);

const dailyStore = fs.readFileSync('pump3/src/services/dailyStore.js', 'utf8');
assert.match(dailyStore, /manual_foods/);
const dailyHook = fs.readFileSync('pump3/src/app/useDailyState.js', 'utf8');
assert.match(dailyHook, /addManualFood/);
assert.match(dailyHook, /removeManualFood/);

const app = fs.readFileSync('pump3/src/App.jsx', 'utf8');
assert.match(app, /useMealFeedback/);
assert.match(app, /eligibleMeals=/);
assert.match(app, /manualFoods/);

const screens = fs.readFileSync('pump3/src/app/screens.jsx', 'utf8');
assert.match(screens, /candidateFilter/);
assert.match(screens, /eligibleMeals/);
assert.match(screens, /onAddFood/);
assert.match(screens, /onRemoveFood/);
assert.doesNotMatch(screens, /setItems\(/, 'manual food must not be local-only state');

const media = fs.readFileSync('pump3/src/training/media/exerciseMedia.js', 'utf8');
assert.match(media, /\/Pump\/exercises\//);
const deploy = fs.readFileSync('.github/workflows/deploy-pump3-pages.yml', 'utf8');
assert.match(deploy, /branches:\s*\[main\]/);
assert.match(deploy, /pump3\/dist/);
assert.match(deploy, /deploy-pages/);

const profile = {
  id: 'release-vegan', sex: 'female', age: 30, heightCm: 165, weightKg: 60,
  targetWeightKg: 60, goal: 'maintain', activity: 'light', diet: 'vegan',
  avoid: [], trainingLevel: 'beginner', trainingPlace: 'bodyweight', trainingDays: 3,
  sessionMinutes: 30, equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none',
};
const plan = buildPersonalizedPlan(profile, { dateKey: '2026-09-22' });
assert.equal(plan.nutrition.status, 'ready');
for (let seed = 1; seed <= 12; seed += 1) {
  const replacement = planDailyNutrition(plan.nutrition.target, {
    diet: plan.nutrition.diet,
    seed,
    candidateFilter: (template) => Boolean(plan.audit.nutritionCoverage?.[template.slot]?.includes(template.id)),
  });
  for (const entry of replacement.meals) {
    assert.ok(plan.audit.nutritionCoverage[entry.slot].includes(entry.template.id), `unsafe replacement ${entry.template.id}`);
  }
}

console.log('PUMP 3 section 6 release readiness passed: production config, persistence, safe replacements, feedback learning, deployment and release paths are gated.');
