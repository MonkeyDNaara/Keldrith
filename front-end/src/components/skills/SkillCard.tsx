import { Check, Lock } from 'lucide-react';
import { useId } from 'react';
import type { PlayerSkillDto } from '../../api/types';
import type { SkillState } from '../../game/skillState';
import { t } from '../../i18n';
import { SkillTypeBadge } from '../ui/SkillTypeBadge';

const texts = t.pages.skills;

// Complete class names (never built from pieces), so Tailwind can find them in the source.
// Record: a new state in SkillState makes TypeScript demand a border here.
const CARD_BORDER: Record<SkillState['kind'], string> = {
  learned: 'border-success',
  learnable: 'border-primary',
  locked: 'border-dashed border-line',
};

interface SkillCardProps {
  skill: PlayerSkillDto;
  state: SkillState;
  /** This skill's request is running (shows "Learning…"). */
  isLearning: boolean;
  /** Any skill request is running: nothing else can be learned until it is done. */
  isBusy: boolean;
  onLearn: (skillId: string) => void;
}

function lockedText(skill: PlayerSkillDto, reason: 'level' | 'points'): string {
  return reason === 'level' ? texts.lockedLevel(skill.requiredLevel) : texts.lockedPoints;
}

/**
 * One skill of the class: what it does, what it costs and what the player can do with it.
 * Learned → badge · learnable → "Learn" button · locked → disabled button with the reason as
 * visible text (a `title` tooltip would be invisible on a phone). Only displays and forwards:
 * the server decides whether learning really works.
 */
export function SkillCard({ skill, state, isLearning, isBusy, onLearn }: SkillCardProps) {
  // Unique per card: ties the disabled button to its reason for screen readers.
  const reasonId = useId();
  const reason = state.kind === 'locked' ? lockedText(skill, state.reason) : null;

  return (
    <article
      className={`flex h-full min-w-0 flex-col gap-2 rounded-box border bg-base-200 p-3 ${CARD_BORDER[state.kind]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="truncate text-base font-semibold">{skill.name}</h2>
        <SkillTypeBadge type={skill.type} />
      </div>

      <p className="text-sm text-muted">{skill.description}</p>

      <p className="flex flex-wrap gap-x-4 text-xs text-faint tabular-nums">
        <span>{t.character.level(skill.requiredLevel)}</span>
        <span>
          {t.character.power} {skill.power}
        </span>
        <span>
          {t.character.manaCost} {skill.manaCost}
        </span>
        <span>{texts.cost(skill.skillPointCost)}</span>
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        {reason && (
          <p id={reasonId} className="flex items-center gap-1 text-sm text-muted">
            <Lock className="size-3.5" aria-hidden="true" />
            {reason}
          </p>
        )}

        {state.kind === 'learned' ? (
          <span className="ml-auto badge badge-soft badge-success">
            <Check className="size-3.5" aria-hidden="true" />
            {texts.learned}
          </span>
        ) : (
          <button
            type="button"
            className="btn ml-auto btn-primary btn-sm"
            disabled={state.kind !== 'learnable' || isBusy}
            // Many buttons say "Learn": the label tells a screen reader which skill this is.
            aria-label={texts.learnLabel(skill.name)}
            aria-describedby={reason ? reasonId : undefined}
            onClick={() => onLearn(skill.skillId)}
          >
            {isLearning && (
              <span className="loading loading-xs loading-spinner" aria-hidden="true" />
            )}
            {isLearning ? texts.learning : texts.learn}
          </button>
        )}
      </div>
    </article>
  );
}
