import { requireSupabase } from './supabase.js';

export async function loadPump3Profile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('pump3_profiles')
    .select('profile,onboarding_complete,updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    profile: data.profile ?? null,
    onboardingComplete: Boolean(data.onboarding_complete),
    updatedAt: data.updated_at ?? null,
  };
}

export async function savePump3Profile(userId, profile, { complete = true } = {}) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('pump3_profiles')
    .upsert({
      user_id: userId,
      profile,
      onboarding_complete: complete,
    }, { onConflict: 'user_id' })
    .select('profile,onboarding_complete,updated_at')
    .single();
  if (error) throw error;
  return {
    profile: data.profile,
    onboardingComplete: Boolean(data.onboarding_complete),
    updatedAt: data.updated_at,
  };
}
