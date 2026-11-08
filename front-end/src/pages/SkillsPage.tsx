import { Link, Navigate, useParams } from 'react-router';
import { SkillsPanel } from '../components/skills/SkillsPanel';
import { PageSpinner } from '../components/ui/PageSpinner';
import { useMyCharacter } from '../hooks/useMyCharacter';
import { t } from '../i18n';
import { parseCharacterId } from '../lib/parseCharacterId';

const texts = t.pages.skills;

/** /characters/:characterId/skills — spend skill points on the skills of the hero's class. */
export function SkillsPage() {
  const characterId = parseCharacterId(useParams().characterId);
  const { data: hero, isPending, isError, refetch } = useMyCharacter();

  if (isPending) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{t.pages.characterDetail.loadError}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => refetch()}>
          {t.pages.characterDetail.retry}
        </button>
      </div>
    );
  }

  // No hero (e.g. deleted in another tab): same way out as on the detail page.
  if (!hero) {
    return <Navigate to="/characters/new" replace />;
  }

  // Invalid id or not the user's hero: same answer as the server's 404 (no hint that it exists).
  if (characterId !== hero.characterId) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl">{t.pages.notFound.title}</h1>
        <p className="text-muted">{t.characterErrors.notFound}</p>
        <Link to="/" className="btn btn-primary btn-sm">
          {texts.backToHero}
        </Link>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{texts.title}</h1>
        <Link to={`/characters/${hero.characterId}`} className="btn btn-ghost btn-sm">
          {texts.backToHero}
        </Link>
      </div>

      <p className="text-muted">{texts.intro}</p>

      <p className="flex items-center gap-2 text-sm">
        <span className="text-muted">{t.character.skillPoints}:</span>
        <span className="badge badge-outline tabular-nums">{hero.skillPoints}</span>
      </p>

      <SkillsPanel character={hero} />
    </section>
  );
}
