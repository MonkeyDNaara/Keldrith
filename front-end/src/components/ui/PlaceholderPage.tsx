import type { ReactNode } from 'react';
import { t } from '../../i18n';

interface PlaceholderPageProps {
  title: string;
  /** Optional extra content, e.g. the route parameter for checking. */
  children?: ReactNode;
}

/** Temporary page body until the real screen is built. */
export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-3xl">{title}</h1>
      <p className="text-muted">{t.pages.comingSoon}</p>
      {children}
    </section>
  );
}
