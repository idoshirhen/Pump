import { useCallback, useEffect, useState } from 'react';
import { loadMealFeedback, saveMealFeedback } from '../services/mealFeedbackStore.js';

export function useMealFeedback(userId) {
  const [state, setState] = useState({ status: userId ? 'loading' : 'ready', items: [], error: null, saving: false });

  const reload = useCallback(async () => {
    if (!userId) return;
    setState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const items = await loadMealFeedback(userId);
      setState({ status: 'ready', items, error: null, saving: false });
    } catch (error) {
      setState({ status: 'error', items: [], error, saving: false });
    }
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  const setFeedback = useCallback(async (recipeId, feedback) => {
    if (!userId) return null;
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      const saved = await saveMealFeedback(userId, recipeId, feedback);
      setState((current) => ({
        ...current,
        status: 'ready',
        saving: false,
        items: [saved, ...current.items.filter((item) => item.recipeId !== recipeId)],
      }));
      return saved;
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error }));
      throw error;
    }
  }, [userId]);

  return { ...state, reload, setFeedback };
}
