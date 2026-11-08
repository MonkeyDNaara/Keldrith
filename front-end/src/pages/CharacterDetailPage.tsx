import { Swords } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { CharacterOverview } from '../components/character/CharacterOverview';
import { DeleteCharacterDialog } from '../components/character/DeleteCharacterDialog';
import { LearnedSkillsList } from '../components/character/LearnedSkillsList';
import { RenameCharacterForm } from '../components/character/RenameCharacterForm';
import { PageSpinner } from '../components/ui/PageSpinner';
import { useClasses } from '../hooks/useClasses';
import { useMyCharacter } from '../hooks/useMyCharacter';
import { t } from '../i18n';
import { parseCharacterId } from '../lib/parseCharacterId';

const texts = t.pages.characterDetail;

/** /characters/:characterId — the user's one hero: overview, skills, rename, delete. */
export function CharacterDetailPage() {
  const characterId = parseCharacterId(useParams().characterId);
  const { data: character, isPending, isError, refetch } = useMyCharacter();
  // Only for the class display name: the page also works while classes load or fail.
  const { data: classes } = useClasses();

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

  // No hero (also right after deleting it: the mutation set the cache to null).
  if (!character) {
    return <Navigate to="/characters/new" replace />;
  }

  // Invalid id or not the user's hero: same answer as the server's 404 (no hint that it exists).
  if (characterId !== character.characterId) {
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

  const classDisplayName = classes?.find((c) => c.classId === character.classId)?.name;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <RenameCharacterForm character={character} />
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/characters/${character.characterId}/fight`}
            className="btn btn-primary btn-sm"
          >
            <Swords className="size-4" aria-hidden="true" />
            {texts.fight}
          </Link>
          <DeleteCharacterDialog
            characterId={character.characterId}
            characterName={character.name}
          />
        </div>
      </div>

      <CharacterOverview character={character} classDisplayName={classDisplayName} />
      <LearnedSkillsList characterId={character.characterId} skills={character.learnedSkills} />
    </section>
  );
}
