import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import type { PlayerCharacterDto } from '../../api/types';
import { useMyCharacter } from '../../hooks/useMyCharacter';
import { t } from '../../i18n';
import { parseCharacterId } from '../../lib/parseCharacterId';
import { PageSpinner } from '../ui/PageSpinner';

type OwnHeroGateTexts = {
  loadError: string;
  retry: string;
  backToHero: string;
};

type OwnHeroGateProps = {
  /** Page-specific texts for the error and "not found" states. */
  texts: OwnHeroGateTexts;
  /** Rendered only once the hero in the URL is the user's own hero. */
  children: (hero: PlayerCharacterDto) => ReactNode;
};

/**
 * Guard for pages under /characters/:characterId/… : loads the user's hero and only renders
 * the page when the id in the URL belongs to it. Handles loading, load error, "no hero yet"
 * and "not your hero" in one place, so every hero page behaves the same.
 */
export function OwnHeroGate({ texts, children }: OwnHeroGateProps) {
  const characterId = parseCharacterId(useParams().characterId);
  const { data: hero, isPending, isError, refetch } = useMyCharacter();

  if (isPending) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{texts.loadError}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => refetch()}>
          {texts.retry}
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

  return children(hero);
}
