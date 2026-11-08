import type { MonsterDto } from '../../api/types';
import { t } from '../../i18n';
import { MonsterCard } from './MonsterCard';

interface MonsterPickerProps {
  monsters: readonly MonsterDto[];
  onSelect: (monster: MonsterDto) => void;
}

/** The list of monsters to fight. Any number fits: 3 today, 30 after a server update. */
export function MonsterPicker({ monsters, onSelect }: MonsterPickerProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl">{t.fight.picker.title}</h2>

      {monsters.length === 0 ? (
        <p className="rounded-box border border-dashed border-line p-4 text-sm text-muted">
          {t.fight.picker.empty}
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
          {monsters.map((monster) => (
            // grid: the card fills the whole cell, so cards in one row are equally tall.
            <li key={monster.npcId} className="grid">
              <MonsterCard monster={monster} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
