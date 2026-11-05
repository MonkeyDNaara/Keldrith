import { createContext, useContext } from 'react';
import type { LoginRequest, RegisterRequest, UserDto } from '../api/types';

/** What every component can read and do with auth. The implementation lives in AuthProvider. */
export interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  /** True while a saved token is checked on start (GET /api/auth/me). */
  isLoading: boolean;
  /** Resolves when logged in; rejects with an ApiError (401 wrong credentials, 0 network …). */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Creates the account and logs in; rejects with an ApiError (400 invalid, 409 taken …). */
  register: (request: RegisterRequest) => Promise<void>;
  /** Removes the token and all cached server data. Safe to call when already logged out. */
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
