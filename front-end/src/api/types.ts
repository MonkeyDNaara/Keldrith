/**
 * API data types, 1:1 with the agreed API contract (JSON in camelCase).
 * Game data ids (classId, skillId, npcId) are plain strings: the server owns that list.
 * Inheritance (`extends`) exists only in the types: the JSON itself is flat.
 */

// ---- Errors ----

/** Error body ASP.NET Core sends for every error (RFC 9457 "Problem Details"). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Only on 400: messages per field, keys in camelCase (e.g. `email`). */
  errors?: Record<string, string[]>;
}

// ---- Auth ----

export type UserRole = 'User' | 'Admin';

export interface UserDto {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  /** ISO 8601 UTC */
  expiresAt: string;
  user: UserDto;
}

// ---- Game data: classes and skills ----

/** `type` (not `interface`) so it can be passed where a Record<string, number> is expected. */
export type StatsDto = {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
};

export interface ClassDto {
  classId: string;
  name: string;
  description: string;
  /** Info text only (e.g. "MeleeDps", "Tank"); nothing is stored. Plain strings: server-owned. */
  roles: string[];
  baseStats: StatsDto;
  statsPerLevel: StatsDto;
}

/** Closed union on purpose: the fight engine needs a rule for every skill type. */
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

/** No extra fields (yet). A type alias, because an empty interface is flagged by ESLint. */
export type MonsterSkillDto = SkillBase;

// ---- Characters and monsters ----

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

/** Discriminator for NPCs. Only monsters exist so far. */
export type NpcKind = 'Monster' | 'FriendlyNpc';

export interface NonPlayerCharacterBase extends CharacterBase {
  npcId: string;
  kind: NpcKind;
}

export interface MonsterDto extends NonPlayerCharacterBase {
  /** Narrowed to one value: `kind === 'Monster'` tells TypeScript it is a MonsterDto. */
  kind: 'Monster';
  xpReward: number;
  skills: MonsterSkillDto[];
}

// ---- Requests: characters and skills ----

/** A second character for the same user → 409. */
export interface CreateCharacterRequest {
  name: string;
  classId: string;
}

/** Only the name can change. */
export interface UpdateCharacterRequest {
  name: string;
}

export interface LearnSkillRequest {
  skillId: string;
}

// ---- Fight results ----

export type FightOutcome = 'Won' | 'Lost' | 'Fled';

/** The client only reports the outcome; the server decides XP from the monster it knows. */
export interface FightResultRequest {
  npcId: string;
  outcome: FightOutcome;
  turns: number;
}

export interface FightRewardDto {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  skillPointsGained: number;
  /** The complete, updated character: replace the cached one with it. */
  character: PlayerCharacterDto;
}
