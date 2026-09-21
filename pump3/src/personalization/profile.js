const GOALS = new Set(['lose', 'gain', 'maintain']);
const SEXES = new Set(['male', 'female']);
const ACTIVITIES = new Set(['sedentary', 'light', 'medium', 'high']);
const DIETS = new Set(['omnivore', 'vegetarian', 'vegan']);
const LEVELS = new Set(['beginner', 'intermediate', 'advanced']);
const PLACES = new Set(['home', 'gym', 'bodyweight']);
const FOCUSES = new Set(['balanced', 'upper', 'lower', 'core']);
const LIMITATIONS = new Set(['none', 'knee', 'shoulder', 'back']);

function finite(value, label, { min, max } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be a finite number`);
  if (min !== undefined && number < min) throw new RangeError(`${label} must be >= ${min}`);
  if (max !== undefined && number > max) throw new RangeError(`${label} must be <= ${max}`);
  return number;
}

function enumValue(value, allowed, label, fallback = null) {
  const normalized = String(value ?? fallback ?? '').trim().toLowerCase();
  if (!allowed.has(normalized)) throw new TypeError(`${label} must be one of: ${[...allowed].join(', ')}`);
  return normalized;
}

function list(value) {
  if (!value) return [];
  if (!Array.isArray(value)) throw new TypeError('profile list fields must be arrays');
  return [...new Set(value.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean))];
}

function normalizeSex(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  const aliases = { man: 'male', m: 'male', male: 'male', woman: 'female', f: 'female', female: 'female' };
  return enumValue(aliases[raw] ?? raw, SEXES, 'sex');
}

export function normalizePersonalizationProfile(input = {}) {
  const personalization = input.personalization ?? {};
  const dietRaw = personalization.foodStyle ?? input.diet ?? 'omnivore';
  const dietAliases = { regular: 'omnivore', mixed: 'omnivore' };
  const diet = enumValue(dietAliases[String(dietRaw).toLowerCase()] ?? dietRaw, DIETS, 'diet');

  const trainingDays = Math.round(finite(input.trainingDays ?? personalization.trainingDays ?? 3, 'trainingDays', { min: 2, max: 6 }));
  const sessionMinutesRaw = finite(personalization.sessionMinutes ?? input.sessionMinutes ?? 30, 'sessionMinutes', { min: 15, max: 90 });
  const sessionMinutes = [20, 30, 45, 60].reduce((best, option) => Math.abs(option - sessionMinutesRaw) < Math.abs(best - sessionMinutesRaw) ? option : best, 30);

  const profile = {
    id: String(input.id ?? 'anonymous'),
    sex: normalizeSex(input.sex ?? input.gender),
    age: finite(input.age, 'age', { min: 16, max: 90 }),
    heightCm: finite(input.heightCm ?? input.height, 'heightCm', { min: 130, max: 230 }),
    weightKg: finite(input.weightKg ?? input.startWeight ?? input.weight, 'weightKg', { min: 35, max: 300 }),
    targetWeightKg: finite(input.targetWeightKg ?? input.targetWeight ?? input.startWeight ?? input.weight, 'targetWeightKg', { min: 35, max: 300 }),
    goal: enumValue(input.goal ?? 'maintain', GOALS, 'goal'),
    activity: enumValue(input.activity ?? 'light', ACTIVITIES, 'activity'),
    diet,
    avoid: list(personalization.avoid ?? input.avoid),
    preferredTags: list(personalization.favorites ?? input.preferredTags),
    dislikedTags: list(personalization.dislikes ?? input.dislikedTags),
    trainingLevel: enumValue(input.trainingLevel ?? personalization.trainingLevel ?? 'beginner', LEVELS, 'trainingLevel'),
    trainingPlace: enumValue(input.trainingPlace ?? personalization.trainingPlace ?? 'home', PLACES, 'trainingPlace'),
    trainingDays,
    sessionMinutes,
    equipment: list(personalization.equipment ?? input.equipment ?? (input.trainingPlace === 'gym' ? ['gym'] : ['bodyweight'])),
    trainingFocus: enumValue(personalization.trainingFocus ?? input.trainingFocus ?? 'balanced', FOCUSES, 'trainingFocus'),
    limitation: enumValue(personalization.limitation ?? input.limitation ?? 'none', LIMITATIONS, 'limitation'),
    mealFeedback: Array.isArray(input.mealFeedback) ? input.mealFeedback.map((entry) => ({ ...entry })) : [],
  };

  if (profile.goal === 'lose' && profile.targetWeightKg > profile.weightKg) {
    throw new TypeError('lose goal requires targetWeightKg <= weightKg');
  }
  if (profile.goal === 'gain' && profile.targetWeightKg < profile.weightKg) {
    throw new TypeError('gain goal requires targetWeightKg >= weightKg');
  }
  return Object.freeze(profile);
}

export const PERSONALIZATION_ENUMS = Object.freeze({
  goals: [...GOALS], sexes: [...SEXES], activities: [...ACTIVITIES], diets: [...DIETS],
  levels: [...LEVELS], places: [...PLACES], focuses: [...FOCUSES], limitations: [...LIMITATIONS],
});
