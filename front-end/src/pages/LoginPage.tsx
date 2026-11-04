import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router';
import { applyAuthError } from '../auth/applyAuthError';
import { useAuth } from '../auth/authContext';
import { loginSchema, type LoginFormValues } from '../auth/authSchemas';
import { DEMO_ACCOUNT, SHOW_DEMO_LOGIN } from '../auth/demoAccount';
import type { LoginRedirectState } from '../auth/ProtectedRoute';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { t } from '../i18n';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  // Where ProtectedRoute sent us from; location.state is untyped, so check it.
  const state = location.state as LoginRedirectState | null;
  const from = typeof state?.from === 'string' ? state.from : '/';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Logged in (also right after a successful submit) → leave the page.
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Only called with valid values: handleSubmit runs the zod schema first.
  async function onSubmit(credentials: LoginFormValues) {
    try {
      await login(credentials);
    } catch (error) {
      applyAuthError(error, setError, ['email', 'password']);
    }
  }

  // Fills the form and submits it: same path, same loading and error states as a manual login.
  function loginAsDemo() {
    setValue('email', DEMO_ACCOUNT.email);
    setValue('password', DEMO_ACCOUNT.password);
    void handleSubmit(onSubmit)();
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">{t.pages.login.title}</h2>

      {/* noValidate: zod validates, not the browser's own bubbles (consistent texts). */}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errors.root?.server && (
          <div role="alert" className="alert alert-soft text-sm alert-error">
            {errors.root.server.message}
          </div>
        )}

        <FormField
          label={t.pages.login.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label={t.pages.login.password}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          {isSubmitting ? t.pages.login.submitting : t.pages.login.submit}
        </button>
      </form>

      {SHOW_DEMO_LOGIN && (
        <>
          <div className="divider my-0 text-sm text-faint">{t.pages.login.demoDivider}</div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={isSubmitting}
            onClick={loginAsDemo}
          >
            {t.pages.login.demoSubmit}
          </button>
          <p className="text-xs text-muted">{t.pages.login.demoHint}</p>
        </>
      )}

      <p className="text-sm text-muted">
        {t.pages.login.noAccount}{' '}
        <Link to="/register" className="link text-accent">
          {t.pages.login.toRegister}
        </Link>
      </p>
    </div>
  );
}
