import type { SkillBase } from '../../api/types';
import { DEFEND_DAMAGE_FACTOR, MIN_DAMAGE, VARIANCE } from './rules';
import type { Rng } from './types';

/** Random factor between `1 - VARIANCE` and `1 + VARIANCE` (0.9 … 1.1). */
export function rollVariance(rng: Rng): number {
  return 1 - VARIANCE + rng() * 2 * VARIANCE;
}

export interface DamageInput {
  /** Attack including buffs. */
  attack: number;
  /** Skill power, 0 for a normal attack. */
  power: number;
  /** Defense of the target. */
  defense: number;
  /** True if the target is defending: incoming damage is reduced. */
  targetDefending: boolean;
}

/** `(attack + power - defense)` ±10 %, halved when the target defends, never below `MIN_DAMAGE`. */
export function calculateDamage(input: DamageInput, rng: Rng): number {
  const base = input.attack + input.power - input.defense;
  const defendFactor = input.targetDefending ? DEFEND_DAMAGE_FACTOR : 1;
  const damage = Math.round(base * rollVariance(rng) * defendFactor);
  return Math.max(MIN_DAMAGE, damage);
}

/** HP actually restored: `power` ±10 %, but never above max HP (can be 0 at full HP). */
export function calculateHeal(power: number, hp: number, maxHp: number, rng: Rng): number {
  const heal = Math.round(power * rollVariance(rng));
  return Math.max(0, Math.min(heal, maxHp - hp));
}

/** A skill can be used when the combatant has at least its mana cost. */
export function canUseSkill(mana: number, skill: SkillBase): boolean {
  return mana >= skill.manaCost;
}
