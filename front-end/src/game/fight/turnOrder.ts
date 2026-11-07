import { isAlive } from './combatants';
import { MIN_SPEED, TIME_SCALE } from './rules';
import type { Combatant, Side } from './types';

/**
 * Turn timeline: every combatant has a point in time (`nextActionAt`) where it acts next.
 * The smallest value goes first. After acting, the point moves back by one interval,
 * and a faster combatant has a shorter interval, so it acts more often.
 * The order is never stored as a list: it follows from these numbers, so a change
 * (e.g. a slow effect) can never leave an outdated list behind.
 */

/** Speed including haste / slow effects, never below `MIN_SPEED`. */
export function getEffectiveSpeed(combatant: Combatant): number {
  return Math.max(MIN_SPEED, combatant.base.stats.speed + combatant.speedBonus);
}

/** Time between two actions of this combatant (shorter = acts more often). */
export function getInterval(combatant: Combatant): number {
  return Math.round(TIME_SCALE / getEffectiveSpeed(combatant));
}

/** Puts everybody on the timeline for the first time: the first action comes after one interval. */
export function startTimeline(combatants: readonly Combatant[]): Combatant[] {
  return combatants.map((c) => ({ ...c, nextActionAt: getInterval(c) }));
}

/** Moves the combatant's next action back by one interval (uses its speed *right now*). */
export function scheduleNextAction(combatant: Combatant): Combatant {
  return { ...combatant, nextActionAt: combatant.nextActionAt + getInterval(combatant) };
}

/** Who acts next: the living combatant with the smallest `nextActionAt`. A tie goes to the first in the array. */
export function getNextActor(combatants: readonly Combatant[]): Combatant | undefined {
  let next: Combatant | undefined;
  for (const combatant of combatants) {
    if (!isAlive(combatant)) continue;
    if (next === undefined || combatant.nextActionAt < next.nextActionAt) {
      next = combatant;
    }
  }
  return next;
}

/**
 * The next `count` actors, e.g. for a "who is next" bar.
 * Assumes that speeds stay as they are now; a later slow effect changes the real order.
 */
export function previewTurnOrder(combatants: readonly Combatant[], count: number): Side[] {
  const order: Side[] = [];
  let timeline = combatants;
  while (order.length < count) {
    const next = getNextActor(timeline);
    if (next === undefined) break;
    order.push(next.side);
    timeline = timeline.map((c) => (c === next ? scheduleNextAction(c) : c));
  }
  return order;
}
