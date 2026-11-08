import { Swords } from 'lucide-react';
import type { MonsterDto } from '../../api/types';
import { t } from '../../i18n';
import { StatList } from '../ui/StatList';

interface MonsterCardProps {
  monster: MonsterDto;
  onSelect: (monster: MonsterDto) => void;
}

const texts = t.fight.picker;

/** One monster to pick: level, what a win is worth, stats and skills. Everything comes from the API. */
export function MonsterCard({ monster, onSelect }: MonsterCardProps) {
  const { name, level, xpReward, stats, skills } = monster;

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-box border border-line bg-base-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-lg">{name}</h3>
        <span className="badge shrink-0 badge-outline badge-sm">{t.character.level(level)}</span>
      </div>

      <p className="text-sm font-semibold text-accent">{texts.reward(xpReward)}</p>

      <StatList stats={stats} />

      <p className="text-sm text-muted">
        <span className="text-faint">{texts.skills}: </span>
        {skills.length > 0 ? skills.map((skill) => skill.name).join(', ') : texts.noSkills}
      </p>

      {/* aria-label: three buttons all saying "Fight" are not distinguishable by screen readers. */}
      <button
        type="button"
        className="btn mt-auto btn-primary btn-sm"
        aria-label={texts.fightWith(name)}
        onClick={() => onSelect(monster)}
      >
        <Swords className="size-4" aria-hidden="true" />
        {texts.fight}
      </button>
    </article>
  );
}
