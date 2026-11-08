import { getStatEntries, type Stats } from '../../game/stats';
import { StatBonus } from './StatBonus';

interface StatListProps {
  stats: Stats;
  /** Bonus sum per stat key (e.g. `{ attack: 3 }`), shown next to the value. Stats without an entry show none. */
  bonuses?: Stats;
}

/**
 * Stats as a description list ("Attack 14"). Built from the data: known stats first in a fixed
 * order, unknown ones from the server last with a readable label. auto-fill = any count fits.
 */
export function StatList({ stats, bonuses }: StatListProps) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-x-3 gap-y-1 text-sm">
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
