import { useCallback, useEffect, useState } from 'react';
import { loadDailyState, loadWeightHistory, saveDailyState, saveWeight } from '../services/dailyStore.js';

function normalizeManualFood(input) {
  const food = {
    id: String(input?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)),
    name: String(input?.name ?? '').trim(),
    calories: Number(input?.calories ?? 0),
    protein: Number(input?.protein ?? 0),
    carbs: Number(input?.carbs ?? 0),
    fat: Number(input?.fat ?? 0),
    source: 'manual',
    addedAt: input?.addedAt ?? new Date().toISOString(),
  };
  if (!food.name) throw new TypeError('food.name is required');
  for (const key of ['calories', 'protein', 'carbs', 'fat']) {
    if (!Number.isFinite(food[key]) || food[key] < 0) throw new TypeError(`${key} must be a non-negative number`);
  }
  if (food.calories <= 0) throw new TypeError('calories must be positive');
  return food;
}

export function useDailyState(userId, dateKey) {
  const [state, setState] = useState({ status: userId ? 'loading' : 'ready', meals: {}, workout: {}, manualFoods: [], weights: [], error: null, saving: false });
  const reload = useCallback(async () => {
    if (!userId) return;
    setState((p) => ({ ...p, status: 'loading', error: null }));
    try {
      const [daily, weights] = await Promise.all([loadDailyState(userId, dateKey), loadWeightHistory(userId)]);
      setState({ status: 'ready', meals: daily.meals, workout: daily.workout, manualFoods: daily.manualFoods, weights, error: null, saving: false });
    } catch (error) { setState((p) => ({ ...p, status: 'error', error, saving: false })); }
  }, [userId, dateKey]);
  useEffect(() => { reload(); }, [reload]);

  const persist = useCallback(async (patch) => {
    if (!userId) return patch;
    setState((p) => ({ ...p, saving: true, error: null }));
    try {
      const saved = await saveDailyState(userId, dateKey, patch);
      setState((p) => ({ ...p, meals: saved.meals, workout: saved.workout, manualFoods: saved.manualFoods, saving: false }));
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
    const current = state.meals[slot];
    const seed = (typeof current === 'object' ? current?.replacementSeed : 0) ?? 0;
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
    const key = `${sessionId}:${exerciseId}`;
    const progress = { ...(state.workout.progress ?? {}) };
    progress[key] = !progress[key];
    return patchWorkout({ progress });
  }, [state.workout, patchWorkout]);
  const replaceExercise = useCallback((sessionId, exerciseId, replacementId) => {
    const replacements = { ...(state.workout.replacements ?? {}), [`${sessionId}:${exerciseId}`]: replacementId };
    return patchWorkout({ replacements });
  }, [state.workout, patchWorkout]);

  const addManualFood = useCallback((foodInput) => {
    const food = normalizeManualFood(foodInput);
    const manualFoods = [food, ...state.manualFoods];
    setState((p) => ({ ...p, manualFoods }));
    return persist({ manualFoods });
  }, [state.manualFoods, persist]);
  const removeManualFood = useCallback((foodId) => {
    const manualFoods = state.manualFoods.filter((food) => food.id !== foodId);
    setState((p) => ({ ...p, manualFoods }));
    return persist({ manualFoods });
  }, [state.manualFoods, persist]);

  const addWeight = useCallback(async (weightKg) => {
    if (!userId) throw new Error('Weight persistence requires an authenticated user');
    setState((p) => ({ ...p, saving: true, error: null }));
    try {
      await saveWeight(userId, dateKey, weightKg);
      const weights = await loadWeightHistory(userId);
      setState((p) => ({ ...p, weights, saving: false }));
    } catch (error) { setState((p) => ({ ...p, saving: false, error })); throw error; }
  }, [userId, dateKey]);

  return {
    ...state,
    reload,
    setMealStatus,
    replaceMeal,
    setMealFeedback,
    completeWorkout,
    toggleExercise,
    replaceExercise,
    addManualFood,
    removeManualFood,
    addWeight,
  };
}
