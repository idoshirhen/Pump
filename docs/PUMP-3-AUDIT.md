# PUMP 3.0 — Full Audit Baseline

Status: in progress
Branch: `pump-3-audit`

## Why this branch exists

`main` stays as the currently working product. PUMP 3.0 work happens here first so architecture, nutrition, personalization, exercise media and testing can be rebuilt without risking the live app.

## Executive summary

PUMP is a working advanced prototype, not yet a production-grade health/fitness product.

The strongest parts are:
- Supabase auth/data model and per-user RLS are mostly sound.
- There is real rule-based personalization, not only 2–3 static presets.
- There are already automated personalization tests covering diet restrictions, equipment, limitations, meal targets and swap combinations.
- The Android app is a functional WebView wrapper around the web product.

The weakest parts are:
- The active React application is shipped as a very large generated/minified bundle (`assets/index-personalized-v2.js`) rather than maintained as normal React source modules.
- Multiple DOM-patching scripts modify React-rendered content after render (meal structure, exercise media, mobile UI, normalization). This makes seemingly simple changes fragile.
- Nutrition values come from a hand-maintained table. The current engine does real arithmetic, but the nutrient source itself is not yet authoritative enough for a product that claims accurate nutrition.
- Exercise media is generated from separate still frames; visual jumps are therefore structural, not just a CSS issue.
- There is no full CI workflow that runs the application/test matrix before deployment.

## KEEP / FIX / REBUILD

| Area | Decision | Notes |
|---|---|---|
| Supabase auth/session | KEEP + harden | Existing app auth flow is usable; email confirmation/password recovery still need a clean production setup. |
| Public DB tables | KEEP + migrate carefully | Data model already covers profile, weight, food, feedback, check-ins, workouts and personalization. |
| Row Level Security | KEEP + audit | Existing user-owned policies are generally the right model. |
| Current UI visual language | KEEP | PUMP brand, dark theme, orange accent and general screen structure are worth preserving. |
| Current generated React bundle | REBUILD | Stop editing the compiled bundle directly. |
| `scripts/build-personalized-bundle.mjs` workflow | REPLACE | Useful as history/reference, but not as the long-term app architecture. |
| DOM MutationObserver patch scripts | REBUILD into React | Functionality should become React components/hooks/services. |
| Meal catalog | KEEP content ideas, rebuild data layer | Recipes can be retained only after recalculating them from a canonical food database. |
| Nutrition accuracy layer | REBUILD core | Preserve its principle (ingredient math), replace hand-entered nutrient constants with sourced food records. |
| Personalization rules | KEEP + formalize | Already meaningful; needs a transparent scoring engine, versioning and scenario tests. |
| Exercise library naming/mapping | KEEP + normalize | Move to canonical exercise IDs instead of text matching. |
| Current animated WebP assets | REPLACE selectively | Keep only clips that pass continuity/form review. |
| Android wrapper | KEEP for now | Good enough as a delivery shell while web core is rebuilt. |
| English support | REBUILD natively | Translation must live in React/i18n, never post-process the DOM. |

## Finding 1 — Architecture

### Current state
The live page loads one large app bundle plus several extra scripts that patch the DOM after React renders it.

Examples of responsibilities currently split outside React:
- meal-structure onboarding logic
- exercise media matching
- missing exercise coverage
- mobile/account actions
- workout timer
- text normalization
- nutrition recalculation

Some scripts use `MutationObserver`, repeated retries, text matching and synthetic button clicks. These are warning signs for long-term maintainability because React and external DOM mutation can fight each other.

### PUMP 3 target

```text
src/
  app/
  components/
  screens/
  onboarding/
  nutrition/
    data/
    engine/
    components/
  training/
    data/
    engine/
    components/
  i18n/
  lib/
  services/
  tests/
```

No business logic should depend on rendered Hebrew strings.

## Finding 2 — Nutrition

### What is better than expected
The current code does contain a real calculation layer. It parses ingredient quantities and recalculates displayed calories/protein. It also attempts to scale portions and add protein/energy boosters to meet targets.

### What is still not acceptable
The nutrient reference table is manually embedded in JavaScript. Even when arithmetic is correct, a wrong per-100g constant produces a wrong result. Several foods are generic categories where brand, fat percentage, preparation method or drained/cooked state materially changes values.

### PUMP 3 target
- Canonical `foods` dataset with source, serving state and units.
- Every recipe references food IDs, not free-text strings.
- Recipe totals are always derived from ingredients.
- No recipe may store an independent calorie total that can disagree with its ingredients.
- Automated tests compare recipe totals against expected tolerances.
- User-facing portions state cooked/raw/drained/prepared where relevant.

## Finding 3 — Personalization

### Current truth
PUMP personalization is real but rule-based. It is not an LLM generating a unique plan from scratch.

Current behavior already varies by combinations such as:
- goal
- calorie/protein target
- diet style
- avoided ingredients
- preferred protein sources
- preparation time
- budget
- training location/equipment
- training focus
- limitation
- session duration
- meal feedback
- day/date rotation

Existing tests explicitly verify that vegan/gluten-free/soy-free users receive different meals, that knee/shoulder limitations alter exercise selection, that equipment changes exercise selection, and that meal feedback can remove recipes.

### PUMP 3 target
Create a versioned, explainable personalization engine:

```text
input profile
  -> eligibility filters
  -> target calculation
  -> recipe/exercise scoring
  -> constraint validation
  -> plan generation
  -> explanation/audit record
```

Every plan should be able to answer: “Why did this user get this?”

## Finding 4 — Exercise media

### Current state
Exercise files are keyed by slugs, but matching is still based heavily on Hebrew/English text found in rendered cards. A second coverage layer exists for missing slugs. Some files are derived from four independent AI stills converted into animated WebP.

### Main failure mode
Separate generated stills do not preserve body geometry, camera position, clothing folds, limb position and background perfectly. A 1→2→3→4 loop therefore creates visible jumps even when the WebP encoding itself is technically valid.

### PUMP 3 target
- Canonical exercise ID per exercise.
- One media record per ID/gender/style.
- Replace poor animations with continuous source video or purpose-built continuous animation.
- Quality gate: motion continuity, correct form, no extra limbs, stable camera/background, correct crop, seamless loop.

## Finding 5 — Data/backend

Public tables currently cover:
- profiles
- user_personalization
- user_meal_feedback
- weight_entries
- food_entries
- meal_actions
- checkins
- workout_completions
- food_analysis_requests

RLS generally follows `auth.uid() = user_id` / `auth.uid() = id`, which is the correct basic ownership model.

PUMP 3 should add explicit schema constraints/checks where practical (allowed enums/statuses, numeric ranges, foreign keys/indexes, version fields for generated plans).

## Finding 6 — Testing/release process

### Existing good work
There are already Node/JSDOM tests for personalization and onboarding. They test real behavioral differences and target guarantees.

### Missing
There is no single release gate that runs all critical checks before deployment.

PUMP 3 release must require:
- unit tests for targets/nutrition/personalization
- integration tests for Supabase-facing flows with mocks/test project
- navigation smoke tests
- RTL/LTR tests
- mobile viewport tests
- exercise media coverage checks
- Android asset-sync/build check

## Six-track rebuild plan

### Track A — Preserve current product
- Freeze `main` except urgent bug fixes.
- PUMP 3 work on dedicated branch.
- Keep current Supabase data compatible during migration.

### Track B — Rebuild source architecture
- Introduce a proper Vite/React source project.
- Recreate screens incrementally using existing UI as reference.
- Remove DOM patch scripts as each feature is migrated.

### Track C — Rebuild nutrition engine
- Create canonical foods table/data file.
- Recalculate all current recipes.
- Add target allocator and portion optimizer.
- Add nutrition audit tests.

### Track D — Formalize personalization
- Convert current rules into explicit modules.
- Add deterministic scenario matrix and explanations.
- Keep AI optional and constrained to tasks where it adds value.

### Track E — Rebuild exercise media pipeline
- Inventory every exercise and every male/female asset.
- Mark PASS / REPLACE / MISSING.
- Replace poor animations with continuous motion assets.

### Track F — Add test/release gate
- CI workflow for tests/build.
- Do not deploy if the matrix fails.

## Immediate next actions

1. Create a clean PUMP 3 source scaffold without changing `main`.
2. Extract target calculation + personalization into importable modules.
3. Build a canonical nutrition data model and audit the existing catalog.
4. Generate an exercise media QA inventory.
5. Add CI that runs current personalization tests immediately, then expand it during migration.

This document will be updated as the audit moves from baseline to verified inventory.