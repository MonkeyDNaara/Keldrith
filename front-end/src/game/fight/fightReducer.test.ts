import { describe, expect, it } from 'vitest';
import { SEED_MONSTERS, SEED_PLAYER_SKILLS } from '../../api/mock/seed';
import type { PlayerSkillDto } from '../../api/types';
import { createFight, createFightReducer, getCombatant } from './fightReducer';
import { fixedRng, makePlayer, sequenceRng } from './testUtils';
import type { Combatant, FightState, Side } from './types';

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

describe('fightReducer: skills', () => {
  const reducer = createFightReducer(fixedRng(0.5));

  function seedSkill(skillId: string): PlayerSkillDto {
    const skill = SEED_PLAYER_SKILLS.find((s) => s.skillId === skillId);
    if (skill === undefined) throw new Error(`Unknown seed skill: ${skillId}`);
    return skill;
  }

  function useSkill(skillId: string) {
    return { type: 'playerTurn', choice: { type: 'skill', skillId } } as const;
  }

  function withCombatant(fight: FightState, side: Side, changes: Partial<Combatant>): FightState {
    return {
      ...fight,
      combatants: fight.combatants.map((c) => (c.side === side ? { ...c, ...changes } : c)),
    };
  }

  const fastPlayer = (skills: PlayerSkillDto[]) =>
    makePlayer({ stats: { ...makePlayer().stats, speed: 20 }, learnedSkills: skills });

  describe('damage skill', () => {
    const fight = createFight(makePlayer({ learnedSkills: [seedSkill('shield-bash')] }), goblin);

    it('hits with attack + power - defense, pays the mana and logs the skill name', () => {
      const after = reducer(fight, useSkill('shield-bash'));
      // attack 14 + power 8 - defense 5 = 17
      expect(getCombatant(after, 'monster').hp).toBe(43);
      expect(getCombatant(after, 'player').mana).toBe(20); // 30 - 10
      expect(after.log).toEqual([
        {
          type: 'damage',
          actor: 'player',
          target: 'monster',
          amount: 17,
          skillName: 'Shield Bash',
        },
      ]);
      expect(after.turn).toBe(1);
    });

    it('works with exactly enough mana and is ignored with one point less', () => {
      expect(
        getCombatant(
          reducer(withCombatant(fight, 'player', { mana: 10 }), useSkill('shield-bash')),
          'player',
        ).mana,
      ).toBe(0);
      const poor = withCombatant(fight, 'player', { mana: 9 });
      expect(reducer(poor, useSkill('shield-bash'))).toBe(poor);
    });
  });

  describe('heal skill', () => {
    const fight = createFight(makePlayer({ learnedSkills: [seedSkill('mend')] }), goblin);

    it('restores HP, pays the mana and logs the amount', () => {
      const hurt = withCombatant(fight, 'player', { hp: 50 });
      const after = reducer(hurt, useSkill('mend'));
      expect(getCombatant(after, 'player').hp).toBe(80);
      expect(getCombatant(after, 'player').mana).toBe(15);
      expect(after.log).toEqual([{ type: 'heal', actor: 'player', amount: 30, skillName: 'Mend' }]);
    });

    it('never heals above max HP and logs only what was really restored', () => {
      const almostFull = withCombatant(fight, 'player', { hp: 110 });
      const after = reducer(almostFull, useSkill('mend'));
      expect(getCombatant(after, 'player').hp).toBe(120);
      expect(after.log).toEqual([{ type: 'heal', actor: 'player', amount: 10, skillName: 'Mend' }]);
    });
  });

  describe('buff skill', () => {
    const fight = createFight(fastPlayer([seedSkill('war-cry')]), goblin);

    it('raises the attack bonus, pays the mana and logs it', () => {
      const after = reducer(fight, useSkill('war-cry'));
      expect(getCombatant(after, 'player').attackBonus).toBe(5);
      expect(getCombatant(after, 'player').mana).toBe(15);
      expect(after.log).toEqual([
        { type: 'buff', actor: 'player', attackGained: 5, skillName: 'War Cry' },
      ]);
    });

    it('makes the following attacks stronger', () => {
      const buffed = reducer(fight, useSkill('war-cry'));
      const after = reducer(buffed, { type: 'playerTurn', choice: { type: 'attack' } });
      expect(getCombatant(after, 'monster').hp).toBe(46); // 14 + 5 - 5 = 14
    });
  });
});

describe('fightReducer: monster turn', () => {
  // The wolf is faster than the player, so the monster starts.
  const wolfFight = createFight(makePlayer(), wolf);
  const monsterTurn = { type: 'monsterTurn' } as const;

  it('attacks when the AI chance roll is high, then rolls the damage', () => {
    const reducer = createFightReducer(sequenceRng([0.9, 0.5]));
    const after = reducer(wolfFight, monsterTurn);
    // wolf attack 12 - player defense 10 = 2
    expect(getCombatant(after, 'player').hp).toBe(118);
    expect(after.log).toEqual([{ type: 'damage', actor: 'monster', target: 'player', amount: 2 }]);
    expect(after.turn).toBe(1);
    expect(after.active).toBe('player'); // wolf next at 1538, player at 1250
  });

  it('can use a damage skill (bite: power 6, 5 mana)', () => {
    const reducer = createFightReducer(sequenceRng([0.1, 0, 0.5]));
    const after = reducer(wolfFight, monsterTurn);
    expect(getCombatant(after, 'player').hp).toBe(112); // 12 + 6 - 10 = 8
    expect(getCombatant(after, 'monster').mana).toBe(10);
    expect(after.log).toEqual([
      { type: 'damage', actor: 'monster', target: 'player', amount: 8, skillName: 'Bite' },
    ]);
  });

  it('can use a buff skill (howl: +3 attack, 10 mana)', () => {
    const reducer = createFightReducer(sequenceRng([0.1, 0.99]));
    const after = reducer(wolfFight, monsterTurn);
    expect(getCombatant(after, 'monster').attackBonus).toBe(3);
    expect(getCombatant(after, 'monster').mana).toBe(5);
    expect(after.log).toEqual([
      { type: 'buff', actor: 'monster', attackGained: 3, skillName: 'Howl' },
    ]);
  });

  it("is ignored when it is the player's turn", () => {
    const reducer = createFightReducer(sequenceRng([]));
    const fight = createFight(makePlayer(), goblin);
    expect(fight.active).toBe('player');
    expect(reducer(fight, monsterTurn)).toBe(fight);
  });

  it('hits a defending player for half the damage', () => {
    const strong = { ...goblin, stats: { ...goblin.stats, attack: 30 } }; // 30 - 10 = 20
    const start = createFight(makePlayer(), strong); // player is faster (8 vs 7)
    const defend = { type: 'playerTurn', choice: { type: 'defend' } } as const;

    const withDefend = createFightReducer(sequenceRng([0.9, 0.5]));
    const defended = withDefend(withDefend(start, defend), monsterTurn);
    expect(getCombatant(defended, 'player').hp).toBe(110); // 120 - 10

    const attack = { type: 'playerTurn', choice: { type: 'attack' } } as const;
    const withAttack = createFightReducer(sequenceRng([0.5, 0.9, 0.5]));
    const open = withAttack(withAttack(start, attack), monsterTurn);
    expect(getCombatant(open, 'player').hp).toBe(100); // 120 - 20
  });
});

describe('fightReducer: outcomes', () => {
  const attack = { type: 'playerTurn', choice: { type: 'attack' } } as const;
  const monsterTurn = { type: 'monsterTurn' } as const;

  function withHp(fight: FightState, side: Side, hp: number): FightState {
    return {
      ...fight,
      combatants: fight.combatants.map((c) => (c.side === side ? { ...c, hp } : c)),
    };
  }

  it('is won when the monster reaches 0 HP', () => {
    const reducer = createFightReducer(fixedRng(0.5));
    const fight = withHp(createFight(makePlayer(), goblin), 'monster', 3);
    const after = reducer(fight, attack);
    expect(after.status).toBe('Won');
    expect(after.log.at(-1)).toEqual({ type: 'defeated', side: 'monster' });
    expect(after.turn).toBe(1);
  });

  it('is lost when the player reaches 0 HP', () => {
    const reducer = createFightReducer(sequenceRng([0.9, 0.5]));
    const fight = withHp(createFight(makePlayer(), wolf), 'player', 1);
    const after = reducer(fight, monsterTurn);
    expect(after.status).toBe('Lost');
    expect(after.log.at(-1)).toEqual({ type: 'defeated', side: 'player' });
  });

  it('is won with a damage skill too', () => {
    const bash = SEED_PLAYER_SKILLS[0];
    const reducer = createFightReducer(fixedRng(0.5));
    const fight = withHp(createFight(makePlayer({ learnedSkills: [bash] }), goblin), 'monster', 10);
    const after = reducer(fight, {
      type: 'playerTurn',
      choice: { type: 'skill', skillId: 'shield-bash' },
    });
    expect(after.status).toBe('Won');
  });

  it('is fled when the player flees, and counts as an action', () => {
    const reducer = createFightReducer(fixedRng(0.5));
    const after = reducer(createFight(makePlayer(), goblin), { type: 'flee' });
    expect(after.status).toBe('Fled');
    expect(after.turn).toBe(1);
    expect(after.log).toEqual([{ type: 'fled', actor: 'player' }]);
  });

  it("cannot flee on the monster's turn", () => {
    const reducer = createFightReducer(fixedRng(0.5));
    const fight = createFight(makePlayer(), wolf);
    expect(reducer(fight, { type: 'flee' })).toBe(fight);
  });

  it('accepts no more actions once the fight is over', () => {
    const reducer = createFightReducer(fixedRng(0.5));
    const won = reducer(withHp(createFight(makePlayer(), goblin), 'monster', 3), attack);
    expect(reducer(won, attack)).toBe(won);
    expect(reducer(won, monsterTurn)).toBe(won);
    expect(reducer(won, { type: 'flee' })).toBe(won);
  });
});
