import type { SkillType } from '../../api/types';
import { t } from '../../i18n';

// SkillType is a closed union: Record (not Partial) makes TypeScript demand a color for every type.
const TYPE_BADGE: Record<SkillType, string> = {
  Damage: 'badge-error',
  Heal: 'badge-success',
  Buff: 'badge-info',
};

interface SkillTypeBadgeProps {
  type: SkillType;
}

/** Small colored label for what a skill does (Damage, Heal, Buff). */
export function SkillTypeBadge({ type }: SkillTypeBadgeProps) {
  return (
    <span className={`badge shrink-0 badge-soft badge-sm ${TYPE_BADGE[type]}`}>
      {t.skillTypes[type]}
    </span>
  );
}
