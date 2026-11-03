import { Link } from 'react-router';
import { t } from '../i18n';

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-display font-black text-accent">404</h1>
        <h2 className="text-2xl">{t.pages.notFound.title}</h2>
        <p className="text-muted">{t.pages.notFound.text}</p>
        <Link to="/" className="btn btn-primary">
          {t.pages.notFound.backHome}
        </Link>
      </div>
    </main>
  );
}
