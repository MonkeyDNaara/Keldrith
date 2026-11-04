import type { ClassDto, MonsterDto, MonsterSkillDto, PlayerSkillDto } from '../types';

/**
 * Read-only game data, the same values as the back-end seeds (agreed API spec).
 * Keep both in sync: then switching from mocks to the real back-end changes nothing.
 * Descriptions are placeholders (the spec has none).
 */

export const SEED_CLASSES: readonly ClassDto[] = [
  {
    classId: 'warrior',
    name: 'Warrior',
    description: 'A sturdy fighter who holds the front line.',
    roles: ['MeleeDps', 'Tank'],
    baseStats: { maxHp: 120, maxMana: 30, attack: 14, defense: 10, speed: 8 },
    statsPerLevel: { maxHp: 12, maxMana: 3, attack: 2, defense: 2, speed: 1 },
  },
  {
    classId: 'ranger',
    name: 'Ranger',
    description: 'A quick hunter who strikes from afar or up close.',
    roles: ['RangedDps', 'MeleeDps'],
    baseStats: { maxHp: 95, maxMana: 40, attack: 16, defense: 6, speed: 12 },
    statsPerLevel: { maxHp: 9, maxMana: 4, attack: 3, defense: 1, speed: 2 },
  },
  {
    classId: 'monk',
    name: 'Monk',
    description: 'A disciplined fighter who strikes fast and mends wounds.',
    roles: ['MeleeDps', 'Healer'],
    baseStats: { maxHp: 105, maxMana: 45, attack: 13, defense: 8, speed: 11 },
    statsPerLevel: { maxHp: 10, maxMana: 4, attack: 2, defense: 1, speed: 2 },
  },
  {
    classId: 'priest',
    name: 'Priest',
    description: 'A devoted caster who smites foes and heals allies.',
    roles: ['RangedDps', 'Healer'],
    baseStats: { maxHp: 85, maxMana: 70, attack: 10, defense: 6, speed: 9 },
    statsPerLevel: { maxHp: 8, maxMana: 7, attack: 1, defense: 1, speed: 1 },
  },
];

/** Shorter rows for the 12 player skills; all cost 1 skill point. */
function playerSkill(
  skillId: string,
  classId: string,
  name: string,
  type: PlayerSkillDto['type'],
  power: number,
  manaCost: number,
  requiredLevel: number,
): PlayerSkillDto {
  return {
    skillId,
    name,
    description: `${name}: a ${type.toLowerCase()} skill.`,
    type,
    power,
    manaCost,
    classId,
    requiredLevel,
    skillPointCost: 1,
  };
}

export const SEED_PLAYER_SKILLS: readonly PlayerSkillDto[] = [
  playerSkill('shield-bash', 'warrior', 'Shield Bash', 'Damage', 8, 10, 1),
  playerSkill('war-cry', 'warrior', 'War Cry', 'Buff', 5, 15, 3),
  playerSkill('whirlwind', 'warrior', 'Whirlwind', 'Damage', 18, 25, 5),
  playerSkill('aimed-shot', 'ranger', 'Aimed Shot', 'Damage', 10, 10, 1),
  playerSkill('poison-arrow', 'ranger', 'Poison Arrow', 'Damage', 14, 18, 3),
  playerSkill('rain-of-arrows', 'ranger', 'Rain of Arrows', 'Damage', 22, 30, 5),
  playerSkill('palm-strike', 'monk', 'Palm Strike', 'Damage', 8, 8, 1),
  playerSkill('inner-calm', 'monk', 'Inner Calm', 'Heal', 20, 15, 3),
  playerSkill('flurry', 'monk', 'Flurry', 'Damage', 20, 25, 5),
  playerSkill('holy-bolt', 'priest', 'Holy Bolt', 'Damage', 10, 10, 1),
  playerSkill('mend', 'priest', 'Mend', 'Heal', 30, 15, 3),
  playerSkill('smite', 'priest', 'Smite', 'Damage', 24, 30, 5),
];

const MONSTER_SKILLS: readonly MonsterSkillDto[] = [
  {
    skillId: 'dirty-stab',
    name: 'Dirty Stab',
    description: 'A sneaky stab.',
    type: 'Damage',
    power: 6,
    manaCost: 5,
  },
  {
    skillId: 'bite',
    name: 'Bite',
    description: 'Sharp teeth.',
    type: 'Damage',
    power: 6,
    manaCost: 5,
  },
  {
    skillId: 'howl',
    name: 'Howl',
    description: 'A howl that raises attack.',
    type: 'Buff',
    power: 3,
    manaCost: 10,
  },
  {
    skillId: 'crushing-blow',
    name: 'Crushing Blow',
    description: 'A heavy hit.',
    type: 'Damage',
    power: 12,
    manaCost: 15,
  },
];

/** Monster skills are shared (join table in the DB): look them up by id. Typos fail fast. */
function monsterSkills(...skillIds: string[]): MonsterSkillDto[] {
  return skillIds.map((skillId) => {
    const skill = MONSTER_SKILLS.find((s) => s.skillId === skillId);
    if (!skill) {
      throw new Error(`Unknown monster skill in seed: ${skillId}`);
    }
    return skill;
  });
}

export const SEED_MONSTERS: readonly MonsterDto[] = [
  {
    npcId: 'goblin',
    kind: 'Monster',
    name: 'Goblin',
    level: 1,
    stats: { maxHp: 60, maxMana: 10, attack: 9, defense: 5, speed: 7 },
    xpReward: 25,
    skills: monsterSkills('dirty-stab'),
  },
  {
    npcId: 'wolf',
    kind: 'Monster',
    name: 'Wolf',
    level: 2,
    stats: { maxHp: 80, maxMana: 15, attack: 12, defense: 6, speed: 13 },
    xpReward: 40,
    skills: monsterSkills('bite', 'howl'),
  },
  {
    npcId: 'orc',
    kind: 'Monster',
    name: 'Orc',
    level: 4,
    stats: { maxHp: 150, maxMana: 30, attack: 18, defense: 12, speed: 6 },
    xpReward: 90,
    skills: monsterSkills('crushing-blow'),
  },
];
