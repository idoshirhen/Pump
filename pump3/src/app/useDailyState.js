import { useCallback, useEffect, useState } from 'react';
import { loadDailyState, loadWeightHistory, saveDailyState, saveWeight } from '../services/dailyStore.js';

export function useDailyState(userId, dateKey) {
  const [state, setState] = useState({ status: userId ? 'loading' : 'ready', meals: {}, workout: {}, weights: [], error: null, saving: false });
  const reload = useCallback(async () => {
    if (!userId) return;
    setState((p) => ({ ...p, status: 'loading', error: null }));
    try {
      const [daily, weights] = await Promise.all([loadDailyState(userId, dateKey), loadWeightHistory(userId)]);
      setState({ status: 'ready', meals: daily.meals, workout: daily.workout, weights, error: null, saving: false });
    } catch (error) { setState((p) => ({ ...p, status: 'error', error, saving: false })); }
  }, [userId, dateKey]);
  useEffect(() => { reload(); }, [reload]);

  const persist = useCallback(async (patch) => {
    if (!userId) return patch;
    setState((p) => ({ ...p, saving: true, error: null }));
    try {
      const saved = await saveDailyState(userId, dateKey, patch);
      setState((p) => ({ ...p, meals: saved.meals, workout: saved.workout, saving: false }));
      return saved;
    } catch (error) { setState((p) => ({ ...p, saving: false, error })); throw error; }
  }, [userId, dateKey]);

  const patchMeal = useCallback(async (slot, patch) => {
    const previous = state.meals[slot];
    const current = typeof previous === 'string' ? { status: previous } : (previous ?? {});
    const meals = { ...state.meals, [slot]: { ...current, ...patch } };
    setState((p) => ({ ...p, meals }));
    return persist({ meals });
  }, [state.meals, persist]);
  const setMealStatus = useCallback((slot, status) => patchMeal(slot, { status }), [patchMeal]);
  const replaceMeal = useCallback((slot) => {
    const current = state.meals[slot]; const seed = (typeof current === 'object' ? current?.replacementSeed : 0) ?? 0;
    return patchMeal(slot, { status: 'planned', replacementSeed: seed + 1, feedback: null });
  }, [state.meals, patchMeal]);
  const setMealFeedback = useCallback((slot, feedback) => patchMeal(slot, { feedback }), [patchMeal]);

  const patchWorkout = useCallback(async (patch) => {
    const workout = { ...state.workout, ...patch };
    setState((p) => ({ ...p, workout }));
    return persist({ workout });
  }, [state.workout, persist]);
  const completeWorkout = useCallback((sessionId) => patchWorkout({ completed: true, sessionId, completedAt: new Date().toISOString() }), [patchWorkout]);
  const toggleExercise = useCallback((sessionId, exerciseId) => {
    const key = `${sessionId}:${exerciseId}`; const progress = { ...(state.workout.progress ?? {}) };
    progress[key] = !progress[key]; return patchWorkout({ progress });
  }, [state.workout, patchWorkout]);
  const replaceExercise = useCallback((sessionId, exerciseId, replacementId) => {
    const replacements = { ...(state.workout.replacements ?? {}), [`${sessionId}:${exerciseId}`]: replacementId };
    return patchWorkout({ replacements });
  }, [state.workout, patchWorkout]);

  const addWeight = useCallback(async (weightKg) => {
    setState((p) => ({ ...p, saving: true, error: null }));
    try { await saveWeight(userId, dateKey, weightKg); const weights = await loadWeightHistory(userId); setState((p) => ({ ...p, weights, saving: false })); }
    catch (error) { setState((p) => ({ ...p, saving: false, error })); throw error; }
  }, [userId, dateKey]);

  return { ...state, reload, setMealStatus, replaceMeal, setMealFeedback, completeWorkout, toggleExercise, replaceExercise, addWeight };
}
