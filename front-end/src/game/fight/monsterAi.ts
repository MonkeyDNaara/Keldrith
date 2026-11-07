import type { SkillBase } from '../../api/types';
import { canUseSkill } from './calc';
import { MONSTER_SKILL_CHANCE } from './rules';
import type { Combatant, Rng, TurnChoice } from './types';

/** A skill is worth trying if the monster can pay it and a heal would not be wasted at full HP. */
function isUsefulSkill(monster: Combatant, skill: SkillBase): boolean {
  const wastedHeal = skill.type === 'Heal' && monster.hp >= monster.base.stats.maxHp;
  return canUseSkill(monster.mana, skill) && !wastedHeal;
}

/**
 * Decides what a monster does on its turn.
 * Rolls, always in this order: (1) skill chance, (2) which skill, only if a skill is used.
 * With chance `MONSTER_SKILL_CHANCE` it uses a random useful skill, otherwise it attacks.
 * If no skill is useful it attacks, even when the chance roll said "skill".
 */
export function chooseMonsterAction(monster: Combatant, rng: Rng): TurnChoice {
  const wantsSkill = rng() < MONSTER_SKILL_CHANCE;
  if (!wantsSkill) {
    return { type: 'attack' };
  }

  const usable = monster.skills.filter((skill) => isUsefulSkill(monster, skill));
  if (usable.length === 0) {
    return { type: 'attack' };
  }

  const picked = usable[Math.floor(rng() * usable.length)];
  return { type: 'skill', skillId: picked.skillId };
}
