import { useCallback, useEffect, useState } from 'react';
import { loadPump3Profile, savePump3Profile } from '../services/profileStore.js';

export function usePumpProfile(userId) {
  const [state, setState] = useState({ status: userId ? 'loading' : 'idle', record: null, error: null });

  const reload = useCallback(async () => {
    if (!userId) return;
    setState((current) => ({ ...current, status: 'loading', error: null }));
    try {
      const record = await loadPump3Profile(userId);
      setState({ status: record ? 'ready' : 'missing', record, error: null });
    } catch (error) {
      setState({ status: 'error', record: null, error });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ status: 'idle', record: null, error: null });
      return;
    }
    reload();
  }, [userId, reload]);

  const save = useCallback(async (profile) => {
    if (!userId) throw new Error('Cannot save profile without an authenticated user');
    setState((current) => ({ ...current, status: 'saving', error: null }));
    try {
      const record = await savePump3Profile(userId, profile, { complete: true });
      setState({ status: 'ready', record, error: null });
      return record;
    } catch (error) {
      setState((current) => ({ ...current, status: 'error', error }));
      throw error;
    }
  }, [userId]);

  return { ...state, reload, save };
}
