import { useState } from 'react';
import { ClassBadge } from '../components/ui/ClassBadge';
import { StatBar } from '../components/ui/StatBar';
import { classColorStyle } from '../game/classVisuals';
import { getStatEntries, type Stats } from '../game/stats';
import { t } from '../i18n';
import { ThemeToggle } from '../theme/ThemeToggle';

// Dev-only styleguide (route /styleguide, not in production builds). Dev texts on purpose.

const SAMPLE_CLASSES = [
  { classId: 'warrior', name: 'Warrior' },
  { classId: 'ranger', name: 'Ranger' },
  { classId: 'monk', name: 'Monk' },
  { classId: 'priest', name: 'Priest' },
  // Not in the registry and no color token: simulates a new class from the server.
  { classId: 'druid' },
];

// Unordered and with an unknown key (critChance) on purpose: tests sorting and fallback.
const SAMPLE_STATS: Stats = {
  speed: 8,
  maxHp: 120,
  critChance: 5,
  attack: 14,
  maxMana: 30,
  defense: 10,
};

const HP_STEP = 25;

export function StyleguidePage() {
  const maxHp = SAMPLE_STATS.maxHp;
  const [hp, setHp] = useState(maxHp);
  const entries = getStatEntries(SAMPLE_STATS);
  const barEntries = entries.filter((entry) => entry.barColor);
  const numberEntries = entries.filter((entry) => !entry.barColor);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-display font-black text-accent">{t.app.name}</h1>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Text</h2>
        <p>Base text – the quick brown fox jumps over the lazy dog.</p>
        <p className="text-muted">Muted text – secondary information.</p>
        <p className="text-faint">Faint text – hints and placeholders.</p>
        <p className="text-accent">Accent text – links and gold highlights.</p>
        <p className="text-danger">Danger text – error messages.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Classes</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
          {SAMPLE_CLASSES.map(({ classId, name }) => (
            <div
              key={classId}
              style={classColorStyle(classId)}
              className="card min-w-0 border border-line bg-base-200"
            >
              <div className="card-body gap-3 p-4">
                <ClassBadge classId={classId} name={name} />
                <StatBar label={t.character.level(3)} value={40} max={200} color="class" />
                {name ? null : <p className="text-sm text-faint">not in registry → fallback</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="flex flex-wrap gap-4">
          {SAMPLE_CLASSES.map(({ classId, name }) => (
            <ClassBadge key={classId} classId={classId} name={name} size="sm" />
          ))}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Stats</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={() => setHp((current) => current - HP_STEP)}
          >
            −{HP_STEP} HP
          </button>
          <button
            type="button"
            className="btn btn-outline btn-success"
            onClick={() => setHp((current) => Math.min(maxHp, current + HP_STEP))}
          >
            +{HP_STEP} HP
          </button>
        </div>
        {barEntries.map((entry) => (
          <StatBar
            key={entry.key}
            label={entry.label}
            value={entry.key === 'maxHp' ? Math.max(0, hp) : entry.value}
            max={entry.value}
            color={entry.barColor ?? 'class'}
          />
        ))}
        <StatBar label={t.character.xp} value={40} max={200} color="xp" />
        <dl className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
          {numberEntries.map((entry) => (
            <div key={entry.key} className="rounded-box border border-line bg-base-200 p-3">
              <dt className="text-sm text-muted">{entry.label}</dt>
              <dd className="text-xl font-semibold tabular-nums">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
