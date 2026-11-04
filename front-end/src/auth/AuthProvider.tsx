import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import { setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken, saveToken } from '../api/tokenStorage';
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../api/types';
import { AuthContext, type AuthContextValue } from './authContext';

/** On start: the user behind a saved token, or null if there is no token. */
async function restoreSession(signal: AbortSignal): Promise<UserDto | null> {
  if (!getToken()) {
    return null;
  }
  return api.auth.me(signal);
}

/**
 * Owns the auth state of the whole app. Talks only to `api`, so it works the same
 * with the mock and the real back-end. Components use it through useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDto | null>(null);
  // Lazy initial state: only a saved token needs checking. Without one there is no spinner.
  const [isLoading, setIsLoading] = useState(() => getToken() !== null);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    // Cached server data belongs to the old user: the next one must never see it.
    queryClient.clear();
  }, [queryClient]);

  // Every request the server rejects with 401 (expired or invalid token) → logout.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Once on start: who is behind the saved token?
  useEffect(() => {
    const controller = new AbortController();

    restoreSession(controller.signal)
      .then((restoredUser) => {
        if (!controller.signal.aborted) {
          setUser(restoredUser);
        }
      })
      .catch(() => {
        // 401: the handler above already logged out. Network / 5xx: the token stays,
        // the user is not logged in for now and lands on /login.
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    // StrictMode runs effects twice in development: the first check is cancelled here.
    return () => controller.abort();
  }, []);

  /** Login and register both answer with AuthResponse: save the token, set the user. */
  const startSession = useCallback(({ token, expiresAt, user: sessionUser }: AuthResponse) => {
    saveToken(token, expiresAt);
    setUser(sessionUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      // Rejects with an ApiError → the form shows it.
      startSession(await api.auth.login(credentials));
    },
    [startSession],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      startSession(await api.auth.register(request));
    },
    [startSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
