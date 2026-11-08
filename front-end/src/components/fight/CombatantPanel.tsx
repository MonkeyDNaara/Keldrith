import { classColorStyle } from '../../game/classVisuals';
import type { Combatant } from '../../game/fight';
import { t } from '../../i18n';
import { ClassBadge } from '../ui/ClassBadge';
import { StatBar } from '../ui/StatBar';
import { StatList } from '../ui/StatList';

interface CombatantPanelProps {
  combatant: Combatant;
  /** True while it is this fighter's turn. */
  isActive: boolean;
  /** Only for the player: shows the class badge and tints the panel in the class color. */
  classId?: string;
  /** Display name of the class (ClassDto.name); without it ClassBadge shows the id. */
  classDisplayName?: string;
}

const texts = t.fight.combatant;

/** One fighter during the fight: name, level, HP and mana bars and active effects. */
export function CombatantPanel({
  combatant,
  isActive,
  classId,
  classDisplayName,
}: CombatantPanelProps) {
  const { base, hp, mana, defending, attackBonus } = combatant;

  return (
    <section
      style={classId ? classColorStyle(classId) : undefined}
      aria-label={base.name}
      className={`flex min-w-0 flex-col gap-3 rounded-box border border-t-4 border-line bg-base-200 p-4 ${
        classId ? 'border-t-class' : 'border-t-line'
      } ${isActive ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="min-w-0 truncate text-lg">{base.name}</h2>
        <div className="flex items-center gap-2">
          {isActive && <span className="badge badge-sm badge-primary">{texts.turn}</span>}
          <span className="badge badge-outline badge-sm">{t.character.level(base.level)}</span>
        </div>
      </div>

      {classId && <ClassBadge classId={classId} name={classDisplayName} size="sm" />}

      <StatBar label={t.stats.maxHp} value={hp} max={base.stats.maxHp} color="hp" />
      <StatBar label={t.stats.maxMana} value={mana} max={base.stats.maxMana} color="mana" />

      {/* What the damage formula uses: attack including buffs (the "Attack +N" badge shows where
          the extra comes from) and defense. Speed is shown on the turn-order bar. */}
      <StatList stats={{ attack: base.stats.attack + attackBonus, defense: base.stats.defense }} />

      {/* Fixed height: the panel does not jump when an effect appears or disappears. */}
      <div className="flex min-h-6 flex-wrap gap-2">
        {defending && (
          <span className="badge badge-soft badge-sm badge-info">{texts.defending}</span>
        )}
        {attackBonus > 0 && (
          <span className="badge badge-soft badge-sm badge-success">
            {texts.attackBonus(attackBonus)}
          </span>
        )}
      </div>
    </section>
  );
}
