import { describe, expect, it } from 'vitest';
import { createCombatant } from './combatants';
import {
  getEffectiveSpeed,
  getInterval,
  getNextActor,
  previewTurnOrder,
  scheduleNextAction,
  startTimeline,
} from './turnOrder';
import type { Combatant, Side } from './types';

function fighter(side: Side, speed: number): Combatant {
  return createCombatant(
    side,
    { name: side, level: 1, stats: { maxHp: 100, maxMana: 0, attack: 10, defense: 5, speed } },
    [],
  );
}

const P = 'player';
const M = 'monster';

describe('getEffectiveSpeed', () => {
  it('adds the speed bonus to the base speed', () => {
    expect(getEffectiveSpeed({ ...fighter(P, 9), speedBonus: 3 })).toBe(12);
  });

  it('never goes below 1, even with a strong slow effect', () => {
    expect(getEffectiveSpeed({ ...fighter(P, 9), speedBonus: -50 })).toBe(1);
  });
});

describe('getInterval', () => {
  it('is shorter for faster combatants', () => {
    expect(getInterval(fighter(P, 9))).toBe(1111);
    expect(getInterval(fighter(M, 4))).toBe(2500);
  });
});

describe('startTimeline', () => {
  it('sets the first action to one interval after the start', () => {
    const [player, monster] = startTimeline([fighter(P, 9), fighter(M, 4)]);
    expect(player.nextActionAt).toBe(1111);
    expect(monster.nextActionAt).toBe(2500);
  });
});

describe('scheduleNextAction', () => {
  it('moves the next action back by one interval and leaves the input unchanged', () => {
    const [player] = startTimeline([fighter(P, 10)]);
    expect(scheduleNextAction(player).nextActionAt).toBe(2000);
    expect(player.nextActionAt).toBe(1000);
  });
});

describe('getNextActor', () => {
  it('picks the combatant with the smallest next action time', () => {
    const timeline = startTimeline([fighter(P, 5), fighter(M, 10)]);
    expect(getNextActor(timeline)?.side).toBe(M);
  });

  it('gives a tie to the first combatant in the array', () => {
    const timeline = startTimeline([fighter(P, 8), fighter(M, 8)]);
    expect(getNextActor(timeline)?.side).toBe(P);
  });

  it('skips defeated combatants', () => {
    const timeline = startTimeline([fighter(P, 20), fighter(M, 5)]);
    const playerDown = [{ ...timeline[0], hp: 0 }, timeline[1]];
    expect(getNextActor(playerDown)?.side).toBe(M);
  });

  it('returns undefined when nobody is alive', () => {
    const timeline = startTimeline([fighter(P, 8)]);
    expect(getNextActor([{ ...timeline[0], hp: 0 }])).toBeUndefined();
  });
});

describe('previewTurnOrder', () => {
  it('lets speed 9 act twice before speed 4 acts once', () => {
    const timeline = startTimeline([fighter(P, 9), fighter(M, 4)]);
    expect(previewTurnOrder(timeline, 9)).toEqual([P, P, M, P, P, M, P, P, M]);
  });

  it('gives roughly 9 : 4 actions over a long fight', () => {
    const timeline = startTimeline([fighter(P, 9), fighter(M, 4)]);
    const playerTurns = previewTurnOrder(timeline, 130).filter((s) => s === P).length;
    expect(playerTurns).toBeGreaterThanOrEqual(89);
    expect(playerTurns).toBeLessThanOrEqual(91); // 130 * 9 / 13 = 90
  });

  it('alternates on equal speed, player first', () => {
    const timeline = startTimeline([fighter(P, 8), fighter(M, 8)]);
    expect(previewTurnOrder(timeline, 6)).toEqual([P, M, P, M, P, M]);
  });

  it('stops early when nobody is alive and does not change its input', () => {
    const timeline = startTimeline([fighter(P, 8), fighter(M, 8)]);
    const before = timeline.map((c) => c.nextActionAt);
    expect(previewTurnOrder(timeline, 4)).toHaveLength(4);
    expect(timeline.map((c) => c.nextActionAt)).toEqual(before);
    expect(
      previewTurnOrder(
        timeline.map((c) => ({ ...c, hp: 0 })),
        4,
      ),
    ).toEqual([]);
  });

  it('applies a slow effect from the next interval on, without rewriting the past', () => {
    const timeline = startTimeline([fighter(P, 10), fighter(M, 10)]);
    expect(previewTurnOrder(timeline, 6)).toEqual([P, M, P, M, P, M]);

    // The monster is slowed to speed 5: its pending action stays at 1000,
    // only the intervals after that become longer.
    const slowed = [timeline[0], { ...timeline[1], speedBonus: -5 }];
    expect(previewTurnOrder(slowed, 9)).toEqual([P, M, P, P, M, P, P, M, P]);
  });
});
