# PUMP 3 source

This directory is the clean-source replacement for the current generated-bundle architecture.

## Rules

1. `main` remains the current live product until PUMP 3 reaches parity.
2. No PUMP 3 business logic may depend on rendered Hebrew text or DOM mutation.
3. Nutrition values must be derived from canonical food records and ingredient quantities.
4. Personalization must be deterministic/testable first; AI is optional and constrained.
5. Every exercise uses a canonical exercise ID, not text matching.
6. Hebrew/English are first-class locales inside React.
7. A change is mergeable only after automated tests pass.

## Intended structure

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
  personalization/
  i18n/
  services/
  lib/
  tests/
```

The current UI is a visual/reference implementation only. Features will move into this source tree incrementally while maintaining compatibility with the existing Supabase schema.
