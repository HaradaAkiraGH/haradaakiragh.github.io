// Контекст аутентификации: пользователь, токен, login/register/logout.
// В демо-режиме (прод без API) прозрачно использует старый мок-логин.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiLogin, apiMe, apiRegister, API_ENABLED } from '../utils/api';
import type { ApiUser } from '../utils/api';

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  ready: boolean;
  demo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'ww_token';
const LEGACY_KEY = 'ww_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [ready, setReady] = useState(false);

  // Восстановление сессии при старте
  useEffect(() => {
    const boot = async () => {
      if (API_ENABLED && token) {
        try {
          const { user: me } = await apiMe(token);
          setUser(me);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } else if (!API_ENABLED) {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy) as { email?: string };
            setUser({ id: 0, email: parsed.email ?? 'demo@wuwa.gg', nickname: 'Rover', role: 'user' });
          } catch {
            /* битый legacy — игнорируем */
          }
        }
      }
      setReady(true);
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    if (API_ENABLED) {
      const payload = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      setUser(payload.user);
    } else {
      localStorage.setItem(LEGACY_KEY, JSON.stringify({ email }));
      setUser({ id: 0, email, nickname: 'Rover', role: 'user' });
    }
  };

  const register = async (email: string, password: string, nickname: string) => {
    if (!API_ENABLED) throw new Error('Регистрация недоступна в демо-режиме');
    const payload = await apiRegister(email, password, nickname);
    localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, ready, demo: !API_ENABLED, login, register, logout }),
    [user, token, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth вызван вне AuthProvider');
  return ctx;
}