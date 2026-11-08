import { getStatEntries, type Stats } from '../../game/stats';
import { StatBonus } from './StatBonus';

interface StatListProps {
  stats: Stats;
  /** Bonus sum per stat key (e.g. `{ attack: 3 }`), shown next to the value. Stats without an entry show none. */
  bonuses?: Stats;
}

// Full class names (no string building), so Tailwind finds them.
const LAYOUTS = {
  // Label left, value right inside an equally wide cell: tidy columns for a plain list.
  plain: {
    list: 'grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-x-3',
    item: 'flex justify-between gap-2',
  },
  // With bonuses ("Attack 20 +0") label, value and bonus stay together, so the bonus can never
  // look like it belongs to the next label. The first group sits left, the last one right.
  withBonus: {
    list: 'flex flex-wrap justify-between gap-x-4',
    item: 'flex gap-2',
  },
} as const;

/**
 * Stats as a description list ("Attack 14"). Built from the data: known stats first in a fixed
 * order, unknown ones from the server last with a readable label. auto-fill = any count fits.
 */
export function StatList({ stats, bonuses }: StatListProps) {
  const layout = bonuses ? LAYOUTS.withBonus : LAYOUTS.plain;

  return (
    <dl className={`gap-y-1 text-sm ${layout.list}`}>
      {getStatEntries(stats).map((stat) => (
        <div key={stat.key} className={layout.item}>
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
