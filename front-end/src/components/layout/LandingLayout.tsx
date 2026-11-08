import { Link, Outlet } from 'react-router';
import { t } from '../../i18n';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { Footer } from './Footer';

/**
 * Frame for the landing page: slim header (wordmark, theme toggle, log in) + footer.
 * <main> has no width limit: the landing sections decide how wide they are,
 * so the hero background can reach from edge to edge.
 */
export function LandingLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-base-200/90">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 sm:px-8">
          <Link
            to="/"
            className="font-display text-xl font-black tracking-wide text-accent sm:text-2xl"
          >
            {t.app.name}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="btn btn-ghost btn-sm">
              {t.pages.landing.login}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
