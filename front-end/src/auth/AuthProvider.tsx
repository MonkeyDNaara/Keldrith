import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import { clearToken, saveToken } from '../api/tokenStorage';
import type { LoginRequest, UserDto } from '../api/types';
import { AuthContext, type AuthContextValue } from './authContext';

// TODO(#11): real auth state (GET /api/auth/me on start, 401 → logout, clear the query cache).
// Bridge until then: login goes through the API layer and saves the token; the user is kept
// in sessionStorage, so a reload during development stays logged in.
const MOCK_STORAGE_KEY = 'keldrith-mock-user';

function readMockUser(): UserDto | null {
  try {
    const saved = sessionStorage.getItem(MOCK_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as UserDto) : null;
  } catch {
    return null;
  }
}

function saveMockUser(user: UserDto | null) {
  try {
    if (user) {
      sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(MOCK_STORAGE_KEY);
    }
  } catch {
    // Storage blocked: the mock login just lasts until the next reload.
  }
}

/** Provides auth state to the whole app. Bridge version: see the TODO above. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(readMockUser);

  const login = useCallback(async (credentials: LoginRequest) => {
    // Rejects with an ApiError (e.g. 401) → the caller shows it.
    const { token, expiresAt, user: loggedInUser } = await api.auth.login(credentials);
    saveToken(token, expiresAt);
    saveMockUser(loggedInUser);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    saveMockUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading: false, login, logout }),
    [user, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
