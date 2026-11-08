import { previewTurnOrder, type Combatant, type Side } from '../../game/fight';
import { t } from '../../i18n';
import { StatBonus } from '../ui/StatBonus';

interface TurnTimelineProps {
  combatants: readonly Combatant[];
  /** How many upcoming turns to show. */
  count?: number;
}

const texts = t.fight.timeline;

// Full class names (no string building), so Tailwind finds them. The first chip is solid = "now".
const CHIP_CLASSES: Record<Side, { now: string; next: string }> = {
  player: { now: 'badge-primary', next: 'badge-soft badge-primary' },
  monster: { now: 'badge-error', next: 'badge-soft badge-error' },
};

/**
 * Who acts next, as a row of chips, plus the speed of both fighters (the reason for the order).
 * The order comes from the engine (`previewTurnOrder`); the UI only displays it.
 */
export function TurnTimeline({ combatants, count = 6 }: TurnTimelineProps) {
  const order = previewTurnOrder(combatants, count);
  const nameOf = (side: Side) => combatants.find((c) => c.side === side)?.base.name ?? side;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg">{texts.title}</h2>
        <p className="flex flex-wrap gap-x-4 text-sm text-muted tabular-nums">
          {combatants.map((c) => (
            <span key={c.side} className="min-w-0">
              <span className="truncate">{c.base.name}</span>
              {': '}
              {t.stats.speed} {c.base.stats.speed}
              <StatBonus bonus={c.speedBonus} />
            </span>
          ))}
        </p>
      </div>

      <ol className="flex flex-wrap items-center gap-1.5">
        {order.map((side, index) => (
          // The order is rebuilt on every render and never reordered by hand: the index is a safe key.
          <li
            key={index}
            aria-current={index === 0 ? 'step' : undefined}
            className={`badge max-w-36 ${index === 0 ? CHIP_CLASSES[side].now : CHIP_CLASSES[side].next}`}
          >
            <span className="truncate">{nameOf(side)}</span>
            {index === 0 && <span className="sr-only"> ({texts.now})</span>}
          </li>
        ))}
      </ol>

      <p className="text-xs text-faint">{texts.hint}</p>
    </section>
  );
}
