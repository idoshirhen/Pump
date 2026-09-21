import { useCallback, useEffect, useState } from 'react';
import { loadDailyState, loadWeightHistory, saveDailyState, saveWeight } from '../services/dailyStore.js';

export function useDailyState(userId, dateKey) {
  const [state, setState] = useState({ status: 'loading', meals: {}, workout: {}, weights: [], error: null });

  const reload = useCallback(async () => {
    if (!userId) return;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const [daily, weights] = await Promise.all([
        loadDailyState(userId, dateKey),
        loadWeightHistory(userId),
      ]);
      setState({ status: 'ready', meals: daily.meals, workout: daily.workout, weights, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, status: 'error', error }));
    }
  }, [userId, dateKey]);

  useEffect(() => { reload(); }, [reload]);

  const setMealStatus = useCallback(async (slot, value) => {
    const meals = { ...state.meals, [slot]: value };
    setState((prev) => ({ ...prev, meals }));
    try {
      const saved = await saveDailyState(userId, dateKey, { meals });
      setState((prev) => ({ ...prev, meals: saved.meals, workout: saved.workout }));
    } catch (error) {
      setState((prev) => ({ ...prev, error }));
      throw error;
    }
  }, [state.meals, userId, dateKey]);

  const completeWorkout = useCallback(async (sessionId) => {
    const workout = { completed: true, sessionId, completedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, workout }));
    const saved = await saveDailyState(userId, dateKey, { workout });
    setState((prev) => ({ ...prev, meals: saved.meals, workout: saved.workout }));
  }, [userId, dateKey]);

  const addWeight = useCallback(async (weightKg) => {
    await saveWeight(userId, dateKey, weightKg);
    const weights = await loadWeightHistory(userId);
    setState((prev) => ({ ...prev, weights }));
  }, [userId, dateKey]);

  return { ...state, reload, setMealStatus, completeWorkout, addWeight };
}
