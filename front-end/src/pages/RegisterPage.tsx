import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router';
import { applyAuthError } from '../auth/applyAuthError';
import { useAuth } from '../auth/authContext';
import {
  AUTH_RULES,
  registerSchema,
  toRegisterRequest,
  type RegisterFormValues,
} from '../auth/authSchemas';
import { FormAlert } from '../components/ui/FormAlert';
import { FormField } from '../components/ui/FormField';
import { PasswordField } from '../components/ui/PasswordField';
import { t } from '../i18n';

export function RegisterPage() {
  const { isAuthenticated, register: registerAccount } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  // Registered = logged in → "/" decides: no character yet → character creation.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerAccount(toRegisterRequest(values));
    } catch (error) {
      // confirmPassword is not sent, so the server can only complain about these three.
      applyAuthError(error, setError, ['username', 'email', 'password']);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">{t.pages.register.title}</h2>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormAlert>{errors.root?.server?.message}</FormAlert>

        <FormField
          label={t.pages.register.username}
          autoComplete="username"
          maxLength={AUTH_RULES.usernameMax}
          error={errors.username?.message}
          {...register('username')}
        />
        <FormField
          label={t.pages.register.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label={t.pages.register.password}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordField
          label={t.pages.register.confirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting && (
            <span className="loading loading-sm loading-spinner" aria-hidden="true" />
          )}
          {isSubmitting ? t.pages.register.submitting : t.pages.register.submit}
        </button>
      </form>

      <p className="text-sm text-muted">
        {t.pages.register.hasAccount}{' '}
        <Link to="/login" className="link text-accent">
          {t.pages.register.toLogin}
        </Link>
      </p>
    </div>
  );
}
