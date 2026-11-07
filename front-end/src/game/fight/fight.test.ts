import { describe, expect, it } from 'vitest';
import { SEED_CLASSES, SEED_MONSTERS, SEED_PLAYER_SKILLS } from '../../api/mock/seed';
import {
  canUseSkill,
  createFight,
  createFightReducer,
  getCombatant,
  type FightAction,
  type FightReducer,
  type FightState,
  type Rng,
} from './index';
import { fixedRng, makePlayer } from './testUtils';

const [goblin] = SEED_MONSTERS;

/** Small, fast, seeded random numbers (mulberry32): the same seed gives the same fight. */
function seededRng(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Player strategy: the first skill it can pay, otherwise a normal attack. */
function playerChoice(state: FightState): FightAction {
  const player = getCombatant(state, 'player');
  const skill = player.skills.find((s) => canUseSkill(player.mana, s));
  return {
    type: 'playerTurn',
    choice: skill ? { type: 'skill', skillId: skill.skillId } : { type: 'attack' },
  };
}

/** Drives a fight to its end, like the fight screen will, and checks the rules on the way. */
function playToEnd(start: FightState, reducer: FightReducer): FightState {
  let state = start;
  for (let step = 0; step < 1000 && state.status === 'Running'; step++) {
    const action: FightAction =
      state.active === 'monster' ? { type: 'monsterTurn' } : playerChoice(state);
    const next = reducer(state, action);
    expect(next).not.toBe(state); // every allowed action moves the fight on

    for (const c of next.combatants) {
      expect(c.hp).toBeGreaterThanOrEqual(0);
      expect(c.hp).toBeLessThanOrEqual(c.base.stats.maxHp);
      expect(c.mana).toBeGreaterThanOrEqual(0);
      expect(c.mana).toBeLessThanOrEqual(c.base.stats.maxMana);
    }
    state = next;
  }
  return state;
}

describe('a complete fight', () => {
  it('plays a scripted level 1 warrior against the goblin to a win', () => {
    // Middle roll everywhere: no damage variance, and the goblin never tries a skill.
    const bash = SEED_PLAYER_SKILLS[0];
    const fight = createFight(makePlayer({ learnedSkills: [bash] }), goblin);
    const end = playToEnd(fight, createFightReducer(fixedRng(0.5)));

    // Order by speed: player, goblin, player, goblin, player, goblin, player (8 vs 7).
    // Shield Bash three times (17 each, 30 mana), then a normal attack (9) finishes the goblin.
    expect(end.status).toBe('Won');
    expect(end.turn).toBe(7);
    expect(getCombatant(end, 'monster').hp).toBe(0);
    expect(getCombatant(end, 'player')).toMatchObject({ hp: 117, mana: 0 }); // 3 goblin hits of 1
    expect(end.log.filter((e) => e.type === 'damage').map((e) => e.amount)).toEqual([
      17, 1, 17, 1, 17, 1, 9,
    ]);
    expect(end.log.at(-1)).toEqual({ type: 'defeated', side: 'monster' });
  });

  it('gives the same result for the same random numbers', () => {
    const fight = createFight(makePlayer({ learnedSkills: [SEED_PLAYER_SKILLS[0]] }), goblin);
    const first = playToEnd(fight, createFightReducer(seededRng(42)));
    const second = playToEnd(fight, createFightReducer(seededRng(42)));
    expect(second).toEqual(first);
  });

  it('always ends with a valid result: every class against every monster, many seeds', () => {
    for (const cls of SEED_CLASSES) {
      const skills = SEED_PLAYER_SKILLS.filter(
        (s) => s.classId === cls.classId && s.requiredLevel <= 1,
      );
      const player = makePlayer({
        classId: cls.classId,
        stats: cls.baseStats,
        learnedSkills: skills,
      });
      for (const monster of SEED_MONSTERS) {
        for (let seed = 1; seed <= 10; seed++) {
          const end = playToEnd(createFight(player, monster), createFightReducer(seededRng(seed)));
          expect(['Won', 'Lost']).toContain(end.status);
          expect(end.turn).toBeGreaterThan(0);
          expect(end.turn).toBeLessThan(1000);
        }
      }
    }
  });
});
