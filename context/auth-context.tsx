import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiError } from '@/services/ai-errors';
import { fetchMe, loginWithEmail, registerWithEmail } from '@/services/auth-api';
import { clearSession, loadSession, saveGuestSession, saveUserSession } from '@/services/auth-storage';
import { setBackendAuthState } from '@/services/backend-client';
import type { PublicUser } from '@/types/auth';

interface AuthContextValue {
  isLoading: boolean;
  user: PublicUser | null;
  token: string | null;
  isGuest: boolean;
  hasSession: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  setSessionFromOAuth: (data: { token: string; user: PublicUser }) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await loadSession();
      if (cancelled) {
        return;
      }
      if (!session) {
        setIsLoading(false);
        return;
      }
      if (session.isGuest) {
        setIsGuest(true);
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      setIsGuest(false);
      setToken(session.token);
      setUser(session.user);
      try {
        const { user: me } = await fetchMe(session.token);
        if (cancelled) {
          return;
        }
        setUser(me);
        await saveUserSession(session.token, me);
      } catch (e) {
        if (cancelled) {
          return;
        }
        // Only an explicit rejection of the token invalidates the session;
        // network failures (offline, backend down) keep the cached session.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          await clearSession();
          setToken(null);
          setUser(null);
          setIsGuest(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setBackendAuthState({ token, isGuest });
  }, [token, isGuest]);

  const setSessionFromOAuth = useCallback(async (data: { token: string; user: PublicUser }) => {
    setIsGuest(false);
    setToken(data.token);
    setUser(data.user);
    await saveUserSession(data.token, data.user);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await loginWithEmail(email, password);
    setIsGuest(false);
    setToken(t);
    setUser(u);
    await saveUserSession(t, u);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { token: t, user: u } = await registerWithEmail(email, password, displayName);
    setIsGuest(false);
    setToken(t);
    setUser(u);
    await saveUserSession(t, u);
  }, []);

  const continueAsGuest = useCallback(async () => {
    setIsGuest(true);
    setUser(null);
    setToken(null);
    try {
      await saveGuestSession();
    } catch {
      // Persistence is best-effort; guest mode works in-memory.
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsGuest(false);
    setUser(null);
    setToken(null);
    await clearSession();
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token || isGuest) {
      return;
    }
    const { user: me } = await fetchMe(token);
    setUser(me);
    await saveUserSession(token, me);
  }, [token, isGuest]);

  const value: AuthContextValue = {
    isLoading,
    user,
    token,
    isGuest,
    hasSession: isGuest || (!!token && !!user),
    signInWithEmail,
    signUp,
    setSessionFromOAuth,
    continueAsGuest,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
