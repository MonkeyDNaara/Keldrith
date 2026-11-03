import { Outlet } from 'react-router';
import { t } from '../../i18n';
import { ThemeToggle } from '../../theme/ThemeToggle';

/** Frame for login and register: wordmark + centered card, theme toggle top right. */
export function AuthLayout() {
  return (
    <div className="relative grid min-h-dvh place-items-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="flex w-full max-w-md flex-col items-center gap-8">
        <h1 className="text-display font-black text-accent">{t.app.name}</h1>
        <div className="card w-full border border-frame bg-base-200 shadow-lg">
          <div className="card-body">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
