import { getStatEntries, type Stats } from '../../game/stats';
import { StatBonus } from './StatBonus';

interface StatListProps {
  stats: Stats;
  /** Bonus sum per stat key (e.g. `{ attack: 3 }`), shown next to the value. Stats without an entry show none. */
  bonuses?: Stats;
}

// Full class names (no string building), so Tailwind finds them. Entries with a bonus ("14 +0")
// are wider, so the label ("Defense") is not cut off.
const COLUMNS = 'grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]';
const COLUMNS_WITH_BONUS = 'grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]';

/**
 * Stats as a description list ("Attack 14"). Built from the data: known stats first in a fixed
 * order, unknown ones from the server last with a readable label. auto-fill = any count fits.
 */
export function StatList({ stats, bonuses }: StatListProps) {
  return (
    <dl className={`grid gap-x-3 gap-y-1 text-sm ${bonuses ? COLUMNS_WITH_BONUS : COLUMNS}`}>
      {getStatEntries(stats).map((stat) => (
        <div key={stat.key} className="flex justify-between gap-2">
          <dt className="truncate text-faint">{stat.label}</dt>
          <dd className="tabular-nums">
            {stat.value}
            {bonuses?.[stat.key] !== undefined && <StatBonus bonus={bonuses[stat.key]} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
