import { describe, expect, it } from 'vitest';
import { SEED_MONSTERS, SEED_PLAYER_SKILLS } from '../../api/mock/seed';
import { createFight, getCombatant } from './fightReducer';
import { makePlayer } from './testUtils';

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
