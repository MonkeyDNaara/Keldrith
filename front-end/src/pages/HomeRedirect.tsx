import { Navigate } from 'react-router';
import { PageSpinner } from '../components/ui/PageSpinner';
import { useMyCharacter } from '../hooks/useMyCharacter';
import { t } from '../i18n';

/** "/" decides where to go: no character yet → creation wizard, else → the character. */
export function HomeRedirect() {
  const { data: character, isPending, isError, refetch } = useMyCharacter();

  if (isPending) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{t.pages.home.loadError}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => refetch()}>
          {t.pages.home.retry}
        </button>
      </div>
    );
  }

  return (
    <Navigate to={character ? `/characters/${character.characterId}` : '/characters/new'} replace />
  );
}
