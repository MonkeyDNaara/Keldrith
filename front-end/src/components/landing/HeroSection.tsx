import { Link } from 'react-router';
import { t } from '../../i18n';

/** Top of the landing page: name, tagline, short intro and the two calls to action. */
export function HeroSection() {
  return (
    <section className="border-b border-line bg-linear-to-b from-accent/15 to-transparent">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-8 sm:py-24">
        <h1 className="text-5xl font-black text-accent sm:text-7xl">{t.app.name}</h1>
        <p className="text-xl font-semibold sm:text-2xl">{t.pages.landing.tagline}</p>
        <p className="max-w-prose text-muted">{t.pages.landing.intro}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/register" className="btn btn-lg btn-primary">
            {t.pages.landing.play}
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            {t.pages.landing.login}
          </Link>
        </div>
      </div>
    </section>
  );
}
