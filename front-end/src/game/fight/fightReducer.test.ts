import { describe, expect, it } from 'vitest';
import { SEED_MONSTERS, SEED_PLAYER_SKILLS } from '../../api/mock/seed';
import { createFight, createFightReducer, getCombatant } from './fightReducer';
import { fixedRng, makePlayer } from './testUtils';
import type { FightState } from './types';

const [goblin, wolf] = SEED_MONSTERS;
const shieldBash = SEED_PLAYER_SKILLS[0];

describe('createFight', () => {
  it('starts a running fight with turn 0 and an empty log', () => {
    const fight = createFight(makePlayer(), goblin);
    expect(fight.status).toBe('Running');
    expect(fight.turn).toBe(0);
    expect(fight.log).toEqual([]);
  });

  it('creates both fighters with full HP and mana', () => {
    const fight = createFight(makePlayer(), goblin);
    expect(getCombatant(fight, 'player')).toMatchObject({ hp: 120, mana: 30 });
    expect(getCombatant(fight, 'monster')).toMatchObject({ hp: 60, mana: 10 });
  });

  it('gives each fighter its own skills', () => {
    const fight = createFight(makePlayer({ learnedSkills: [shieldBash] }), goblin);
    expect(getCombatant(fight, 'player').skills).toEqual([shieldBash]);
    expect(getCombatant(fight, 'monster').skills).toEqual(goblin.skills);
  });

  it('puts both on the timeline: one interval after the start', () => {
    const fight = createFight(makePlayer(), goblin);
    expect(getCombatant(fight, 'player').nextActionAt).toBe(1250); // 10000 / 8
    expect(getCombatant(fight, 'monster').nextActionAt).toBe(1429); // 10000 / 7
  });

  it('lets the faster fighter start', () => {
    expect(createFight(makePlayer(), goblin).active).toBe('player'); // speed 8 vs 7
    expect(createFight(makePlayer(), wolf).active).toBe('monster'); // speed 8 vs 13
  });

  it('lets the player start on equal speed', () => {
    const sameSpeed = { ...goblin, stats: { ...goblin.stats, speed: 8 } };
    expect(createFight(makePlayer(), sameSpeed).active).toBe('player');
  });
});

describe('getCombatant', () => {
  it('returns the fighter of the given side', () => {
    const fight = createFight(makePlayer(), goblin);
    expect(getCombatant(fight, 'player').base.name).toBe('Aldric');
    expect(getCombatant(fight, 'monster').base.name).toBe('Goblin');
  });

  it('throws for a side that is not in the fight', () => {
    const fight = { ...createFight(makePlayer(), goblin), combatants: [] };
    expect(() => getCombatant(fight, 'player')).toThrow();
  });
});

describe('fightReducer: attack', () => {
  const reducer = createFightReducer(fixedRng(0.5)); // middle roll: no variance
  const attack = { type: 'playerTurn', choice: { type: 'attack' } } as const;

  it('damages the monster with attack minus defense and logs it', () => {
    const fight = createFight(makePlayer(), goblin);
    const after = reducer(fight, attack);
    // attack 14 - defense 5 = 9
    expect(getCombatant(after, 'monster').hp).toBe(51);
    expect(after.log).toEqual([{ type: 'damage', actor: 'player', target: 'monster', amount: 9 }]);
    expect(after.turn).toBe(1);
  });

  it('hands the turn to the monster and moves the player on the timeline', () => {
    const after = reducer(createFight(makePlayer(), goblin), attack);
    expect(getCombatant(after, 'player').nextActionAt).toBe(2500); // 1250 + 1250
    expect(after.active).toBe('monster'); // 1429 comes before 2500
  });

  it('adds the attack bonus', () => {
    const fight = createFight(makePlayer(), goblin);
    const buffed: FightState = {
      ...fight,
      combatants: fight.combatants.map((c) => (c.side === 'player' ? { ...c, attackBonus: 5 } : c)),
    };
    expect(getCombatant(reducer(buffed, attack), 'monster').hp).toBe(46); // 14 + 5 - 5 = 14
  });

  it('never lets HP drop below 0', () => {
    const fight = createFight(makePlayer(), goblin);
    const nearlyDead: FightState = {
      ...fight,
      combatants: fight.combatants.map((c) => (c.side === 'monster' ? { ...c, hp: 3 } : c)),
    };
    expect(getCombatant(reducer(nearlyDead, attack), 'monster').hp).toBe(0);
  });

  it('does not change the old state', () => {
    const fight = createFight(makePlayer(), goblin);
    const snapshot = structuredClone(fight);
    const after = reducer(fight, attack);
    expect(after).not.toBe(fight);
    expect(fight).toEqual(snapshot);
  });
});

describe('fightReducer: defend', () => {
  const reducer = createFightReducer(fixedRng(0.5));
  const defend = { type: 'playerTurn', choice: { type: 'defend' } } as const;
  const attack = { type: 'playerTurn', choice: { type: 'attack' } } as const;
  // Speed 20 against 7: the player acts twice before the goblin acts once.
  const fastPlayer = makePlayer({ stats: { ...makePlayer().stats, speed: 20 } });

  it('sets the defending flag and logs it', () => {
    const after = reducer(createFight(fastPlayer, goblin), defend);
    expect(getCombatant(after, 'player').defending).toBe(true);
    expect(after.log).toEqual([{ type: 'defend', actor: 'player' }]);
    expect(after.turn).toBe(1);
  });

  it('ends the defense when the combatant acts again', () => {
    const afterDefend = reducer(createFight(fastPlayer, goblin), defend);
    expect(afterDefend.active).toBe('player');
    const afterAttack = reducer(afterDefend, attack);
    expect(getCombatant(afterAttack, 'player').defending).toBe(false);
    expect(afterAttack.log).toHaveLength(2);
  });
});

describe('fightReducer: actions that are not allowed', () => {
  const reducer = createFightReducer(fixedRng(0.5));
  const attack = { type: 'playerTurn', choice: { type: 'attack' } } as const;

  it("ignores the player when it is the monster's turn", () => {
    const fight = createFight(makePlayer(), wolf); // wolf is faster
    expect(fight.active).toBe('monster');
    expect(reducer(fight, attack)).toBe(fight);
  });

  it('ignores everything once the fight is over', () => {
    const over: FightState = { ...createFight(makePlayer(), goblin), status: 'Won' };
    expect(reducer(over, attack)).toBe(over);
  });

  it('ignores a skill the player has not learned', () => {
    const fight = createFight(makePlayer(), goblin);
    const unknown = { type: 'playerTurn', choice: { type: 'skill', skillId: 'nope' } } as const;
    expect(reducer(fight, unknown)).toBe(fight);
  });
});
