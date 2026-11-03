import { Navigate, Outlet, useLocation } from 'react-router';
import { t } from '../i18n';
import { useAuth } from './authContext';

/** Location state for /login, so the login page can send the user back afterwards. */
export interface LoginRedirectState {
  from: string;
}

/**
 * Layout route that only renders its child routes for logged-in users.
 * Logged out → /login (remembering where the user wanted to go).
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span
          className="loading loading-lg loading-spinner text-primary"
          aria-label={t.common.loading}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    const state: LoginRedirectState = { from: location.pathname };
    return <Navigate to="/login" replace state={state} />;
  }

  return <Outlet />;
}
