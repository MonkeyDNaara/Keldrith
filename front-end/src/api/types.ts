/**
 * API data types, 1:1 with the agreed API contract (JSON in camelCase).
 * Game data ids (classId, skillId, npcId) are plain strings: the server owns that list.
 * Only the types needed so far; the rest of the contract follows with the API client.
 */

// ---- Auth ----

export type UserRole = 'User' | 'Admin';

export interface UserDto {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ---- Characters ----

/** `type` (not `interface`) so it can be passed where a Record<string, number> is expected. */
export type StatsDto = {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
};

export type SkillType = 'Damage' | 'Heal' | 'Buff';

export interface SkillBase {
  skillId: string;
  name: string;
  description: string;
  type: SkillType;
  power: number;
  manaCost: number;
}

export interface PlayerSkillDto extends SkillBase {
  classId: string;
  requiredLevel: number;
  skillPointCost: number;
}

/** Shared by players and monsters (the fight engine works on this). */
export interface CharacterBase {
  name: string;
  level: number;
  stats: StatsDto;
}

export interface PlayerCharacterDto extends CharacterBase {
  characterId: number;
  classId: string;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  learnedSkills: PlayerSkillDto[];
  /** ISO 8601 UTC */
  createdAt: string;
}
