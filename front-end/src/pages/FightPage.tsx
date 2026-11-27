import { useState } from 'react';
import { Link } from 'react-router';
import type { MonsterDto, PlayerCharacterDto } from '../api/types';
import { OwnHeroGate } from '../components/character/OwnHeroGate';
import { FightArena } from '../components/fight/FightArena';
import { MonsterPicker } from '../components/fight/MonsterPicker';
import { PageSpinner } from '../components/ui/PageSpinner';
import { useClasses } from '../hooks/useClasses';
import { useMonsters } from '../hooks/useMonsters';
import { t } from '../i18n';

const texts = t.pages.fight;

/** /characters/:characterId/fight — pick a monster, fight it, see the reward. */
export function FightPage() {
  return <OwnHeroGate texts={texts}>{(hero) => <FightContent hero={hero} />}</OwnHeroGate>;
}

/** The fight page once the hero is known: loads the monsters, then picker or arena. */
function FightContent({ hero }: { hero: PlayerCharacterDto }) {
  const monsters = useMonsters();
  // Only for the class display name: the page also works while classes load or fail.
  const { data: classes } = useClasses();
  // The monster being fought, or null while the player is still choosing.
  const [selected, setSelected] = useState<MonsterDto | null>(null);

  if (monsters.isPending) {
    return <PageSpinner />;
  }

  if (monsters.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{texts.loadError}</p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => void monsters.refetch()}
        >
          {texts.retry}
        </button>
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
