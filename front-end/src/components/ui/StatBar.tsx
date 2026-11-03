import type { BarColor } from '../../game/stats';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  /** 'class' uses --class-color, so a parent must set classColorStyle(). */
  color: BarColor;
  /** Show "value / max" next to the label. */
  showValue?: boolean;
}

// Full class names, so Tailwind finds them (no `bg-${color}` string building).
const FILL_CLASSES: Record<BarColor, string> = {
  hp: 'bg-hp',
  mana: 'bg-mana',
  xp: 'bg-primary',
  class: 'bg-class',
};

const TRACK_CLASSES: Record<BarColor, string> = {
  hp: 'bg-hp/20',
  mana: 'bg-mana/20',
  xp: 'bg-primary/20',
  class: 'bg-class/20',
};

/** Fill in percent, always between 0 and 100 (also for max = 0 or overheal). */
function toPercent(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Animated, accessible bar for HP, mana, XP or a class-colored value. */
export function StatBar({ label, value, max, color, showValue = true }: StatBarProps) {
  const percent = toPercent(value, max);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex justify-between gap-2 text-sm text-muted">
        <span className="truncate">{label}</span>
        {showValue && (
          <span className="shrink-0 tabular-nums">
            {value} / {max}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={`h-3 overflow-hidden rounded-full ${TRACK_CLASSES[color]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-600 ease-out motion-reduce:transition-none ${FILL_CLASSES[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
