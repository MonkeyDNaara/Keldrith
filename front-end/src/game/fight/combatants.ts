import type { CharacterBase, SkillBase } from '../../api/types';
import type { Combatant, Side } from './types';

/**
 * Builds a fresh fighter: full HP and mana, no effects.
 * Works for players and monsters alike, because both extend `CharacterBase`.
 * `nextActionAt` starts at 0; `createFight` puts everybody on the timeline.
 */
export function createCombatant(
  side: Side,
  base: CharacterBase,
  skills: readonly SkillBase[],
): Combatant {
  return {
    side,
    // Only what the fight needs: a whole PlayerCharacterDto must not travel along.
    base: { name: base.name, level: base.level, stats: base.stats },
    skills,
    hp: base.stats.maxHp,
    mana: base.stats.maxMana,
    defending: false,
    attackBonus: 0,
    speedBonus: 0,
    nextActionAt: 0,
  };
}

/** Attack including buffs. */
export function getAttack(combatant: Combatant): number {
  return combatant.base.stats.attack + combatant.attackBonus;
}

export function isAlive(combatant: Combatant): boolean {
  return combatant.hp > 0;
}
