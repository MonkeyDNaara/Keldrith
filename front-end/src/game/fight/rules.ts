/**
 * Balance numbers of the fight engine in one place.
 * Changing a rule means changing one line here, not hunting through the reducer.
 */

/** Damage and heals vary by ±10 %: the factor is `1 - VARIANCE` … `1 + VARIANCE`. */
export const VARIANCE = 0.1;

/** Every hit does at least this much, so a fight can never stall. */
export const MIN_DAMAGE = 1;

/** While defending, incoming damage is multiplied by this (until the own next turn). */
export const DEFEND_DAMAGE_FACTOR = 0.5;

/** Chance that a monster tries a skill instead of a normal attack. */
export const MONSTER_SKILL_CHANCE = 0.3;

/**
 * Turn timeline: one action "costs" `TIME_SCALE / speed` time units, so a faster
 * combatant gets its next turn sooner. Integers keep ties exact (no float rounding).
 */
export const TIME_SCALE = 10_000;

/** Speed below this (e.g. a strong slow effect) counts as this, so we never divide by 0. */
export const MIN_SPEED = 1;
