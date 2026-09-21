import { requireSupabase } from './supabase.js';

export async function loadDailyState(userId, date) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('pump3_daily_state')
    .select('meals,workout,manual_foods,updated_at')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { meals: data.meals ?? {}, workout: data.workout ?? {}, manualFoods: data.manual_foods ?? [], updatedAt: data.updated_at ?? null }
    : { meals: {}, workout: {}, manualFoods: [], updatedAt: null };
}

export async function saveDailyState(userId, date, patch) {
  const current = await loadDailyState(userId, date);
  const next = {
    meals: patch.meals ?? current.meals,
    workout: patch.workout ?? current.workout,
    manualFoods: patch.manualFoods ?? current.manualFoods,
  };
  const client = requireSupabase();
  const { data, error } = await client.from('pump3_daily_state').upsert({
    user_id: userId,
    date,
    meals: next.meals,
    workout: next.workout,
    manual_foods: next.manualFoods,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' }).select('meals,workout,manual_foods,updated_at').single();
  if (error) throw error;
  return {
    meals: data.meals ?? {},
    workout: data.workout ?? {},
    manualFoods: data.manual_foods ?? [],
    updatedAt: data.updated_at ?? null,
  };
}

export async function loadWeightHistory(userId, limit = 24) {
  const client = requireSupabase();
  const { data, error } = await client.from('pump3_weight_entries')
    .select('date,weight_kg,created_at')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({ date: row.date, weightKg: Number(row.weight_kg), createdAt: row.created_at }));
}

export async function saveWeight(userId, date, weightKg) {
  const client = requireSupabase();
  const weight = Number(weightKg);
  if (!Number.isFinite(weight) || weight <= 20 || weight >= 400) throw new TypeError('weightKg out of range');
  const { data, error } = await client.from('pump3_weight_entries').upsert({ user_id: userId, date, weight_kg: weight }, { onConflict: 'user_id,date' })
    .select('date,weight_kg,created_at').single();
  if (error) throw error;
  return { date: data.date, weightKg: Number(data.weight_kg), createdAt: data.created_at };
}
