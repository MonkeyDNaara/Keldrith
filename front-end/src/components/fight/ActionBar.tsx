import { Shield, Swords, Wind } from 'lucide-react';
import { canUseSkill, type Combatant, type TurnChoice } from '../../game/fight';
import { t } from '../../i18n';

/** Whose turn it is, or that the fight is over (then nothing can be chosen). */
export type FightPhase = 'player' | 'monster' | 'over';

interface ActionBarProps {
  /** The player's fighter: its mana, HP and skills decide which buttons work. */
  player: Combatant;
  phase: FightPhase;
  onChoose: (choice: TurnChoice) => void;
  onFlee: () => void;
}

const texts = t.fight.actions;

/**
 * Attack, defend, flee and one button per skill the hero has learned (so 0 or 12 skills both fit).
 * Only a hint for the player: the engine ignores an action that is not allowed anyway.
 */
export function ActionBar({ player, phase, onChoose, onFlee }: ActionBarProps) {
  const canAct = phase === 'player';

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg">{texts.title}</h2>
        {phase !== 'over' && (
          // aria-live: a screen reader announces the change between "your turn" and "monster".
          <p className="text-sm text-muted" aria-live="polite">
            {canAct ? texts.yourTurn : texts.monsterTurn}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canAct}
          onClick={() => onChoose({ type: 'attack' })}
        >
          <Swords className="size-4" aria-hidden="true" />
          {texts.attack}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={!canAct}
          onClick={() => onChoose({ type: 'defend' })}
        >
          <Shield className="size-4" aria-hidden="true" />
          {texts.defend}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-warning"
          disabled={!canAct}
          onClick={onFlee}
        >
          <Wind className="size-4" aria-hidden="true" />
          {texts.flee}
        </button>
      </div>

      {player.skills.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-muted">{texts.skills}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2">
            {player.skills.map((skill) => {
              const enoughMana = canUseSkill(player.mana, skill);
              // A heal at full HP would only cost mana: the engine allows it, the UI does not offer it.
              const wastedHeal = skill.type === 'Heal' && player.hp >= player.base.stats.maxHp;
              const reason = !enoughMana
                ? texts.notEnoughMana
                : wastedHeal
                  ? texts.fullHealth
                  : undefined;

              return (
                <li key={skill.skillId} className="min-w-0">
                  <button
                    type="button"
                    className="btn h-auto w-full flex-col items-start gap-0 btn-outline py-2 text-left"
                    disabled={!canAct || reason !== undefined}
                    title={reason}
                    onClick={() => onChoose({ type: 'skill', skillId: skill.skillId })}
                  >
                    <span className="w-full truncate">{skill.name}</span>
                    <span className="text-xs font-normal text-muted">
                      {t.skillTypes[skill.type]} · {texts.manaCost(skill.manaCost)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
