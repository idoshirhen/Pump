import assert from 'node:assert/strict';
import fs from 'node:fs';

const required = [
  'pump3/src/App.jsx',
  'pump3/src/app/AuthScreen.jsx',
  'pump3/src/app/OnboardingScreen.jsx',
  'pump3/src/app/useSession.js',
  'pump3/src/app/usePumpProfile.js',
  'pump3/src/services/supabase.js',
  'pump3/src/services/auth.js',
  'pump3/src/services/profileStore.js',
  'pump3/src/app/screens.jsx',
  'pump3/src/training/components/ExerciseDemo.jsx',
];

for (const path of required) assert.ok(fs.existsSync(path), `missing frontend module: ${path}`);

const app = fs.readFileSync('pump3/src/App.jsx', 'utf8');
assert.match(app, /useSession/);
assert.match(app, /usePumpProfile/);
assert.match(app, /AuthScreen/);
assert.match(app, /OnboardingScreen/);
assert.doesNotMatch(app, /pump-(nutrition|exercise|mobile|meal)-/i, 'PUMP 3 App must not depend on legacy runtime patches');

const supabase = fs.readFileSync('pump3/src/services/supabase.js', 'utf8');
assert.match(supabase, /persistSession:\s*true/);
assert.match(supabase, /autoRefreshToken:\s*true/);

const migration = fs.readFileSync('supabase/migrations/20260922003000_add_pump3_profiles.sql', 'utf8');
assert.match(migration, /enable row level security/i);
assert.match(migration, /auth\.uid\(\) = user_id/);
assert.match(migration, /profile jsonb not null/i);

const screens = fs.readFileSync('pump3/src/app/screens.jsx', 'utf8');
assert.match(screens, /NutritionScreen/);
assert.match(screens, /TrainingScreen/);
assert.match(screens, /ProgressScreen/);

console.log('PUMP 3 section 5 frontend contract passed: clean app shell, auth gate, native onboarding, isolated profile store and feature screens are wired.');
