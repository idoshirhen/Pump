import { requireSupabase } from './supabase.js';

export async function getCurrentSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

export function onAuthStateChange(callback) {
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session ?? null));
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session ?? null;
}

export async function signUpWithPassword(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
