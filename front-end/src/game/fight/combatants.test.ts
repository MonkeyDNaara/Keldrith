import { describe, expect, it } from 'vitest';
import { SEED_MONSTERS, SEED_PLAYER_SKILLS } from '../../api/mock/seed';
import type { CharacterBase } from '../../api/types';
import { createCombatant, getAttack, isAlive } from './combatants';

const hero: CharacterBase = {
  name: 'Aldric',
  level: 3,
  stats: { maxHp: 144, maxMana: 36, attack: 18, defense: 14, speed: 10 },
};

// First seed monster: the goblin (60 HP, 10 mana, one skill).
const goblin = SEED_MONSTERS[0];

describe('createCombatant', () => {
  it('starts with full HP and full mana', () => {
    const player = createCombatant('player', hero, []);
    expect(player.hp).toBe(144);
    expect(player.mana).toBe(36);

    const monster = createCombatant('monster', goblin, goblin.skills);
    expect(monster.hp).toBe(60);
    expect(monster.mana).toBe(10);
  });

  it('starts without defending, bonuses or timeline position', () => {
    const player = createCombatant('player', hero, []);
    expect(player.defending).toBe(false);
    expect(player.attackBonus).toBe(0);
    expect(player.speedBonus).toBe(0);
    expect(player.nextActionAt).toBe(0);
  });

  it('keeps only name, level and stats of the given character', () => {
    const monster = createCombatant('monster', goblin, goblin.skills);
    expect(monster.base).toEqual({ name: 'Goblin', level: 1, stats: goblin.stats });
  });

  it('keeps the skills it is given', () => {
    const warriorSkills = SEED_PLAYER_SKILLS.filter((s) => s.classId === 'warrior');
    expect(createCombatant('player', hero, warriorSkills).skills).toHaveLength(3);
    expect(createCombatant('monster', goblin, goblin.skills).skills[0].skillId).toBe('dirty-stab');
  });
});

describe('getAttack', () => {
  it('adds the attack bonus to the base attack', () => {
    const player = createCombatant('player', hero, []);
    expect(getAttack(player)).toBe(18);
    expect(getAttack({ ...player, attackBonus: 5 })).toBe(23);
  });
});

describe('isAlive', () => {
  it('is true above 0 HP and false at 0', () => {
    const player = createCombatant('player', hero, []);
    expect(isAlive(player)).toBe(true);
    expect(isAlive({ ...player, hp: 0 })).toBe(false);
  });
});
