import { useState, useCallback, useEffect } from 'react';
import { AuthContext } from './authContext';
import { login as apiLogin, register as apiRegister, logout as apiLogout, refresh as apiRefresh, getProfile } from '../services/authApi';
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from '../services/tokenService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = getAccessToken();
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch {
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    }
    void initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const resp = await apiLogin(credentials);
    // resp: { user, accessToken, refreshToken }
    setAccessToken(resp.accessToken);
    setRefreshToken(resp.refreshToken);
    setUser(resp.user);
    return resp;
  }, []);

  const register = useCallback(async (payload) => {
    const resp = await apiRegister(payload);
    return resp;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refresh = getRefreshToken();
      await apiLogout(refresh);
    } catch {
      // ignore errors
    }
    clearTokens();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const data = await apiRefresh(refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data.accessToken;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
