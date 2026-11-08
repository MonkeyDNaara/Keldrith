import { Outlet } from 'react-router';
import { Footer } from './Footer';
import { TopBar } from './TopBar';

/** Frame for all pages after login: top bar + centered content area + footer. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
