export function calculateNutritionTargets(profile) {
  const weight = Number(profile.start_weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  const gain = profile.goal === 'gain' || (profile.goal === 'event' && Number(profile.target_weight) > weight);
  const base = 10 * weight + 6.25 * height - 5 * age + (profile.sex === 'male' ? 5 : -161);
  const activity = { low: 1.2, light: 1.375, medium: 1.55 }[profile.activity] ?? 1.375;
  const adjustment = gain ? (profile.pace === 'steady' ? 250 : 350) : (profile.pace === 'steady' ? -350 : -500);
  return { calories: Math.max(1200, Math.round((base * activity + adjustment) / 50) * 50), protein: Math.round(weight * (gain && profile.training_level === 'experienced' ? 1.8 : 1.6)) };
}
