import type { CSSProperties } from 'react';
import { ThemeToggle } from './theme/ThemeToggle';

// TEMPORARY token preview for visual checks of issue #4 – replaced by the router in #5.

const BARS = [
  { label: 'HP', value: 72, max: 100, color: 'text-hp' },
  { label: 'Mana', value: 30, max: 50, color: 'text-mana' },
  { label: 'XP', value: 40, max: 100, color: 'text-primary' },
];

// 'necromancer' has no color token on purpose: it must fall back to the neutral class color.
const CLASS_IDS = ['warrior', 'ranger', 'monk', 'priest', 'necromancer'];

function classColorStyle(classId: string): CSSProperties {
  return { '--class-color': `var(--class-${classId})` } as CSSProperties;
}

function App() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-display font-black text-accent">Keldrith</h1>
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
        <h2 className="text-xl">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary">
            Start fight
          </button>
          <button type="button" className="btn btn-outline btn-primary">
            Rename
          </button>
          <button type="button" className="btn btn-ghost">
            Cancel
          </button>
          <button type="button" className="btn btn-error">
            Delete
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Bars</h2>
        {BARS.map((bar) => (
          <label key={bar.label} className="flex flex-col gap-1">
            <span className="flex justify-between text-sm text-muted">
              <span>{bar.label}</span>
              <span>
                {bar.value} / {bar.max}
              </span>
            </span>
            <progress className={`progress h-3 ${bar.color}`} value={bar.value} max={bar.max} />
          </label>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Surfaces & classes</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
          {CLASS_IDS.map((classId) => (
            <div
              key={classId}
              style={classColorStyle(classId)}
              className="card min-w-0 border border-line bg-base-200"
            >
              <div className="card-body gap-2 p-4">
                <span className="h-2 rounded-full bg-class" />
                <h3 className="truncate text-lg text-class capitalize">{classId}</h3>
                <p className="text-sm text-muted">Card on surface with class color.</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-box border border-frame bg-base-300 p-4 text-sm">
          Raised surface with gold frame.
        </div>
      </section>
    </main>
  );
}

export default App;
