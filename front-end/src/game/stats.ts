import { t } from '../i18n';

/** Color variants a stat bar can have (see StatBar). */
export type BarColor = 'hp' | 'mana' | 'xp' | 'class';

/** Stats as the API sends them. Keys stay open, so a new stat from the server never breaks the UI. */
export type Stats = Readonly<Record<string, number>>;

export interface StatMeta {
  label: string;
  order: number;
  barColor?: BarColor;
}

export interface StatEntry extends StatMeta {
  key: string;
  value: number;
}

const STAT_META: Partial<Record<string, StatMeta>> = {
  maxHp: { label: t.stats.maxHp, order: 1, barColor: 'hp' },
  maxMana: { label: t.stats.maxMana, order: 2, barColor: 'mana' },
  attack: { label: t.stats.attack, order: 3 },
  defense: { label: t.stats.defense, order: 4 },
  speed: { label: t.stats.speed, order: 5 },
};

/** Unknown stats are listed after the known ones. */
const UNKNOWN_ORDER = Number.MAX_SAFE_INTEGER;

/** "critChance" → "Crit Chance": readable label for a stat we have no text for yet. */
function humanize(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function getStatMeta(key: string): StatMeta {
  return STAT_META[key] ?? { label: humanize(key), order: UNKNOWN_ORDER };
}

/** Turns a stats object into a sorted list for rendering: known stats first, unknown ones last. */
export function getStatEntries(stats: Stats): StatEntry[] {
  return Object.entries(stats)
    .map(([key, value]) => ({ key, value, ...getStatMeta(key) }))
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}
