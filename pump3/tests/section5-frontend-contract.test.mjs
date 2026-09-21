import assert from 'node:assert/strict';
import fs from 'node:fs';

const required = [
  'pump3/src/App.jsx',
  'pump3/src/app/AuthScreen.jsx',
  'pump3/src/app/OnboardingScreen.jsx',
  'pump3/src/app/useSession.js',
  'pump3/src/app/usePumpProfile.js',
  'pump3/src/app/useDailyState.js',
  'pump3/src/services/supabase.js',
  'pump3/src/services/auth.js',
  'pump3/src/services/profileStore.js',
  'pump3/src/services/dailyStore.js',
  'pump3/src/app/screens.jsx',
  'pump3/src/training/components/ExerciseDemo.jsx',
];
for (const path of required) assert.ok(fs.existsSync(path), `missing frontend module: ${path}`);

const app = fs.readFileSync('pump3/src/App.jsx', 'utf8');
assert.match(app, /useSession/);
assert.match(app, /usePumpProfile/);
assert.match(app, /useDailyState/);
assert.match(app, /AuthScreen/);
assert.match(app, /OnboardingScreen/);
assert.doesNotMatch(app, /pump-(nutrition|exercise|mobile|meal)-/i, 'PUMP 3 App must not depend on legacy runtime patches');

const supabase = fs.readFileSync('pump3/src/services/supabase.js', 'utf8');
assert.match(supabase, /persistSession:\s*true/);
assert.match(supabase, /autoRefreshToken:\s*true/);

const profileMigration = fs.readFileSync('supabase/migrations/20260922003000_add_pump3_profiles.sql', 'utf8');
assert.match(profileMigration, /enable row level security/i);
assert.match(profileMigration, /auth\.uid\(\) = user_id/);
assert.match(profileMigration, /profile jsonb not null/i);

const dailyMigration = fs.readFileSync('supabase/migrations/20260922005000_add_pump3_daily_state.sql', 'utf8');
assert.match(dailyMigration, /pump3_daily_state/i);
assert.match(dailyMigration, /pump3_weight_entries/i);
assert.match(dailyMigration, /enable row level security/i);
assert.match(dailyMigration, /auth\.uid\(\) = user_id/);

const dailyStore = fs.readFileSync('pump3/src/services/dailyStore.js', 'utf8');
assert.match(dailyStore, /loadDailyState/);
assert.match(dailyStore, /saveDailyState/);
assert.match(dailyStore, /loadWeightHistory/);
assert.match(dailyStore, /saveWeight/);

const screens = fs.readFileSync('pump3/src/app/screens.jsx', 'utf8');
assert.match(screens, /onMealStatus/);
assert.match(screens, /onCompleteWorkout/);
assert.match(screens, /onAddWeight/);
assert.match(screens, /NutritionScreen/);
assert.match(screens, /TrainingScreen/);
assert.match(screens, /ProgressScreen/);

console.log('PUMP 3 section 5 frontend contract passed: auth, onboarding, feature screens and authenticated daily persistence are isolated from legacy runtime patches.');
