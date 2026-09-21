import { useEffect, useState } from 'react';
import { getCurrentSession, onAuthStateChange } from '../services/auth.js';
import { hasSupabaseConfig } from '../services/supabase.js';

export function useSession() {
  const [state, setState] = useState(() => ({
    status: hasSupabaseConfig ? 'loading' : 'demo',
    session: null,
    error: null,
  }));

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;
    let active = true;

    getCurrentSession()
      .then((session) => {
        if (active) setState({ status: session ? 'authenticated' : 'anonymous', session, error: null });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', session: null, error });
      });

    const unsubscribe = onAuthStateChange((session) => {
      if (active) setState({ status: session ? 'authenticated' : 'anonymous', session, error: null });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}
