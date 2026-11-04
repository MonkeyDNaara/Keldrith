import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { LoginRequest, UserDto } from '../api/types';
import { AuthContext, type AuthContextValue } from './authContext';

// TODO(#11): replace the mock with the real API (POST /api/auth/login, token, GET /api/auth/me).
// The mock keeps the user in sessionStorage, so a reload during development stays logged in.
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

/** Provides auth state to the whole app. Mock: every email/password combination logs in. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(readMockUser);

  const login = useCallback(async ({ email }: LoginRequest) => {
    const mockUser: UserDto = {
      userId: 1,
      username: email.split('@')[0] || 'hero',
      email,
      role: 'User',
    };
    saveMockUser(mockUser);
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    saveMockUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading: false, login, logout }),
    [user, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
