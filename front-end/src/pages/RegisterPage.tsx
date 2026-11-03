import { Link } from 'react-router';
import { t } from '../i18n';

// TODO(#11): real form (username, email, password, field errors).
export function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl">{t.pages.register.title}</h2>
      <p className="text-muted">{t.pages.comingSoon}</p>
      <p className="text-sm text-muted">
        {t.pages.register.hasAccount}{' '}
        <Link to="/login" className="link text-accent">
          {t.pages.register.toLogin}
        </Link>
      </p>
    </div>
  );
}
