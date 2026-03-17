import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, loginUser, signupUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('manoshaanti_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        setUser(me.user || null);
      } catch {
        localStorage.removeItem('manoshaanti_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function login(payload) {
    const data = await loginUser(payload);
    localStorage.setItem('manoshaanti_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function signup(payload) {
    const data = await signupUser(payload);
    localStorage.setItem('manoshaanti_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('manoshaanti_token');
    localStorage.removeItem('manoshaanti_profile');
    setToken('');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      signup,
      logout,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
