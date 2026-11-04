import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { DEMO_ACCOUNT } from '../api/mock/mockDb';
import { useAuth } from '../auth/authContext';
import type { LoginRedirectState } from '../auth/ProtectedRoute';
import { t } from '../i18n';

// TODO(#11): real form (email, password, field errors).
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where ProtectedRoute sent us from; location.state is untyped, so check it.
  const state = location.state as LoginRedirectState | null;
  const from = typeof state?.from === 'string' ? state.from : '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleMockLogin() {
    await login({ ...DEMO_ACCOUNT });
    navigate(from, { replace: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">{t.pages.login.title}</h2>
      <p className="text-sm text-muted">{t.pages.login.mockHint}</p>
      <button type="button" className="btn btn-primary" onClick={handleMockLogin}>
        {t.pages.login.mockSubmit}
      </button>
      <p className="text-sm text-muted">
        {t.pages.login.noAccount}{' '}
        <Link to="/register" className="link text-accent">
          {t.pages.login.toRegister}
        </Link>
      </p>
    </div>
  );
}
