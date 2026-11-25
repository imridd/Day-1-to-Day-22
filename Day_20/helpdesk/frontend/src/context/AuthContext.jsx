import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, clearAccessToken, getAccessToken, setAccessToken } from '../api/axios';

const AuthContext = createContext(null);

function isBrowserRefresh() {
  const navigation = performance.getEntriesByType?.('navigation')?.[0];
  return navigation?.type === 'reload';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)));

  const clearLocalSession = useCallback(() => {
    clearAccessToken();
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const storedToken = sessionStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      clearAccessToken();
      setLoading(false);
      return () => { cancelled = true; };
    }

    setAccessToken(storedToken);

    // A hard refresh must sign out. Keep the token briefly in sessionStorage
    // only so this request can release the server-side active session.
    if (isBrowserRefresh()) {
      api.post('/auth/logout')
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            clearLocalSession();
            setLoading(false);
          }
        });
      return () => { cancelled = true; };
    }

    api.get('/auth/me')
      .then((response) => { if (!cancelled) setUser(response.data); })
      .catch(() => { if (!cancelled) clearLocalSession(); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [clearLocalSession]);

  // Renew the server-side lease while this tab remains open.
  useEffect(() => {
    if (!token) return undefined;
    const timer = window.setInterval(() => {
      api.post('/auth/heartbeat').catch(() => {
        clearLocalSession();
        if (window.location.pathname !== '/login') window.location.assign('/login');
      });
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [token, clearLocalSession]);

  // Best-effort release when the tab is closed or refreshed. The reload path
  // above also awaits logout, so refresh does not depend solely on pagehide.
  useEffect(() => {
    if (!token) return undefined;
    const release = () => {
      const currentToken = getAccessToken();
      if (!currentToken) return;
      fetch(`${api.defaults.baseURL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('pagehide', release);
    return () => window.removeEventListener('pagehide', release);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setAccessToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const currentToken = getAccessToken();
    const request = currentToken
      ? api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${currentToken}` } }).catch(() => {})
      : Promise.resolve();
    clearLocalSession();
    await request;
  }, [clearLocalSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
