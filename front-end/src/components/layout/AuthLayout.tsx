import { Outlet } from 'react-router';
import { t } from '../../i18n';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { Footer } from './Footer';

/** Frame for login and register: wordmark + centered card, theme toggle top right, footer. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {/* flex-1 pushes the footer to the bottom; the grid centers the card in the space left. */}
      <main className="grid flex-1 place-items-center p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <h1 className="text-display font-black text-accent">{t.app.name}</h1>
          <div className="card w-full border border-frame bg-base-200 shadow-lg">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
