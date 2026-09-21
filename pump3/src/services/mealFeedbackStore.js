import { requireSupabase } from './supabase.js';

export async function loadMealFeedback(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('user_meal_feedback')
    .select('recipe_id,feedback,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    recipeId: row.recipe_id,
    feedback: row.feedback,
    updatedAt: row.updated_at,
  }));
}

export async function saveMealFeedback(userId, recipeId, feedback) {
  const client = requireSupabase();
  const allowed = new Set(['liked', 'not_for_me', 'too_expensive', 'too_slow', 'still_hungry']);
  if (!allowed.has(feedback)) throw new TypeError('Unsupported meal feedback value');
  const { data, error } = await client.from('user_meal_feedback').upsert({
    user_id: userId,
    recipe_id: recipeId,
    feedback,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,recipe_id' }).select('recipe_id,feedback,updated_at').single();
  if (error) throw error;
  return { recipeId: data.recipe_id, feedback: data.feedback, updatedAt: data.updated_at };
}
