import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import type { MonsterDto } from '../api/types';
import { FightArena } from '../components/fight/FightArena';
import { MonsterPicker } from '../components/fight/MonsterPicker';
import { PageSpinner } from '../components/ui/PageSpinner';
import { useClasses } from '../hooks/useClasses';
import { useMonsters } from '../hooks/useMonsters';
import { useMyCharacter } from '../hooks/useMyCharacter';
import { t } from '../i18n';
import { parseCharacterId } from '../lib/parseCharacterId';

const texts = t.pages.fight;

/** /characters/:characterId/fight — pick a monster, fight it, see the reward. */
export function FightPage() {
  const characterId = parseCharacterId(useParams().characterId);
  const character = useMyCharacter();
  const monsters = useMonsters();
  // Only for the class display name: the page also works while classes load or fail.
  const { data: classes } = useClasses();
  // The monster being fought, or null while the player is still choosing.
  const [selected, setSelected] = useState<MonsterDto | null>(null);

  if (character.isPending || monsters.isPending) {
    return <PageSpinner />;
  }

  if (character.isError || monsters.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{texts.loadError}</p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            // Only reload what failed.
            if (character.isError) void character.refetch();
            if (monsters.isError) void monsters.refetch();
          }}
        >
          {texts.retry}
        </button>
      </div>
    );
  }

  // No hero (e.g. deleted in another tab): same way out as on the detail page.
  if (!character.data) {
    return <Navigate to="/characters/new" replace />;
  }

  const hero = character.data;

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

  const classDisplayName = classes?.find((c) => c.classId === hero.classId)?.name;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{texts.title}</h1>
        {/* While a fight runs there is no way out except fleeing or finishing it. */}
        {selected === null && (
          <Link to={`/characters/${hero.characterId}`} className="btn btn-ghost btn-sm">
            {texts.backToHero}
          </Link>
        )}
      </div>

      {selected === null ? (
        <MonsterPicker monsters={monsters.data} onSelect={setSelected} />
      ) : (
        // Going back to the picker unmounts the arena, so every new fight starts from fresh state.
        <FightArena
          character={hero}
          monster={selected}
          classDisplayName={classDisplayName}
          onFightAgain={() => setSelected(null)}
        />
      )}
    </section>
  );
}
