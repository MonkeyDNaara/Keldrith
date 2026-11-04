import { createContext, useContext } from 'react';
import type { LoginRequest, UserDto } from '../api/types';

/** What every component can read and do with auth. The implementation lives in AuthProvider. */
export interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  /** True while the app checks a saved session on start (GET /api/auth/me later). */
  isLoading: boolean;
  /** Resolves when logged in; rejects with an Error if the login fails. */
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

// null = "no provider above": useAuth() turns that into a clear error.
export const AuthContext = createContext<AuthContextValue | null>(null);

/** Access auth state and actions. Must be used inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}
