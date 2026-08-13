export function getStoredSession(storage = localStorage) {
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.includes('auth-token')) continue;
    try {
      const parsed = JSON.parse(storage.getItem(key) || '{}');
      const session = parsed.currentSession || parsed.session || parsed;
      if (session?.access_token && session?.user?.id) return session;
    } catch (_) { /* Ignore unrelated or malformed storage. */ }
  }
  return null;
}

export function createSupabaseRestClient({ url, publishableKey, fetchImpl = fetch, getSession = getStoredSession }) {
  const request = async (path, init = {}) => {
    const session = getSession();
    if (!session) throw new Error('פג תוקף החיבור. יש להתחבר מחדש.');
    const response = await fetchImpl(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
      body: init.body && typeof init.body !== 'string' ? JSON.stringify(init.body) : init.body
    });
    if (!response.ok) throw new Error('לא הצלחנו לשמור את העדכון. נסו שוב.');
    return response.status === 204 ? null : response.json();
  };
  return { request, userId: () => getSession()?.user?.id ?? null };
}
