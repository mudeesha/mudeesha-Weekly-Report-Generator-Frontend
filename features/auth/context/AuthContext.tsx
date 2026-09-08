'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/services/auth.service';
import { ApiError, AUTH_EXPIRED_EVENT, getToken, setToken, errorMessage } from '@/lib/api-client';
import type { User, UserRole } from '@/types';
interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isManager: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logout = useCallback(() => { setToken(null); setUser(null); setError(null); setLoading(false); }, []);
  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const next = await authApi.me();
      if (token !== getToken())
        return;
      setUser(previous => previous && previous.id === next.id && previous.name === next.name && previous.email === next.email && previous.role === next.role ? previous : next);
    }
    catch (e) {
      if (token !== getToken())
        return;
      if (e instanceof ApiError && (e.status === 401 || e.status === 403))
        logout();
      else
        setError(errorMessage(e));
    }
    finally {
      setLoading(false);
    }
  }, [logout]);
  useEffect(() => { void refreshUser(); }, [refreshUser]);
  useEffect(() => {
    const expired = () => { setUser(null); setLoading(false); setError('Your session ended. Please sign in again.'); };
    const focus = () => {
      if (getToken())
        void refreshUser();
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);
    window.addEventListener('focus', focus);
    return () => { window.removeEventListener(AUTH_EXPIRED_EVENT, expired); window.removeEventListener('focus', focus); };
  }, [refreshUser]);
  const login = useCallback(async (email: string, password: string) => {
    const next = await authApi.login(email, password);
    setUser(next);
    setError(null);
    setLoading(false);
    return next;
  }, []);
  const value = useMemo(() => ({ user, role: user?.role ?? null, isManager: user?.role === 'MANAGER' || user?.role === 'ADMIN', isAdmin: user?.role === 'ADMIN', isAuthenticated: !!user, loading, error, login, logout, refreshUser }), [user, loading, error, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext); if (!value)
    throw new Error('useAuth must be used inside AuthProvider'); return value;
}
