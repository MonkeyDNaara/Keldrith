import type { KeldrithApi } from '../api';
import { notifyUnauthorized } from '../client';
import { ApiError } from '../errors';
import { getToken } from '../tokenStorage';
import type { AuthResponse, FightOutcome, PlayerCharacterDto, StatsDto, UserDto } from '../types';
import {
  readDb,
  updateDb,
  type CharacterRecord,
  type MockDbState,
  type UserRecord,
} from './mockDb';
import { SEED_CLASSES, SEED_MONSTERS, SEED_PLAYER_SKILLS } from './seed';

/**
 * The API running in the browser. Same rules, status codes and DTOs as the back-end,
 * so components can't tell the difference. Rule: validate first, then change the data.
 */

// ---- Rules (same values as the back-end) ----

const MOCK_DELAY_MS = 300;
const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000; // JWT: 8 h
const MAX_LEVEL = 10;
const FIGHT_OUTCOMES: readonly FightOutcome[] = ['Won', 'Lost', 'Fled'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const xpToNextLevel = (level: number) => 50 * (level + 1);

// ---- Helpers: errors ----

function validationError(errors: Record<string, string[]>): ApiError {
  return new ApiError(400, {
    status: 400,
    title: 'One or more validation errors occurred.',
    errors,
  });
}

function lengthError(field: string, value: string, min: number, max: number): string[] {
  const length = value.trim().length;
  return length < min || length > max ? [`${field} must be ${min}–${max} characters.`] : [];
}

/** Collects field messages; throws one 400 with all of them (like ASP.NET model validation). */
function throwIfInvalid(errors: Record<string, string[]>): void {
  const withMessages = Object.fromEntries(Object.entries(errors).filter(([, m]) => m.length > 0));
  if (Object.keys(withMessages).length > 0) {
    throw validationError(withMessages);
  }
}

const notFound = () => new ApiError(404, { status: 404, title: 'Not Found' });
const conflict = (detail: string) => new ApiError(409, { status: 409, title: 'Conflict', detail });

// ---- Helpers: delay, auth, mapping ----

/** Fake network delay, so loading states are visible. Honors a cancelled request. */
async function delay(signal?: AbortSignal): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  signal?.throwIfAborted();
}

/** Mock token = "mock-token.<userId>". Not a real JWT: only the mock can read it. */
function createAuthResponse(user: UserRecord): AuthResponse {
  return {
    token: `mock-token.${user.userId}`,
    expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString(),
    user: toUserDto(user),
  };
}

/** Like [Authorize]: the user behind the saved token, else 401 (and logout, as with HTTP). */
function requireUser(db: Readonly<MockDbState>): UserRecord {
  const token = getToken();
  const userId = Number(token?.replace('mock-token.', ''));
  const user = db.users.find((u) => u.userId === userId);
  if (!user) {
    if (token) {
      notifyUnauthorized();
    }
    throw new ApiError(401, { status: 401, title: 'Unauthorized' });
  }
  return user;
}

/** Ownership: a foreign or missing id gives the same 404 (no hint that it exists). */
function findOwnCharacter(db: Readonly<MockDbState>, userId: number, characterId: number) {
  const character = db.characters.find((c) => c.characterId === characterId && c.userId === userId);
  if (!character) {
    throw notFound();
  }
  return character;
}

function toUserDto({ userId, username, email, role }: UserRecord): UserDto {
  return { userId, username, email, role };
}

/** stats = baseStats + statsPerLevel * (level - 1), computed like on the server. */
function statsFor(classId: string, level: number): StatsDto {
  const playerClass = SEED_CLASSES.find((c) => c.classId === classId);
  if (!playerClass) {
    throw new ApiError(500, { status: 500, title: `Unknown class in mock data: ${classId}` });
  }
  const { baseStats: base, statsPerLevel: per } = playerClass;
  const n = level - 1;
  return {
    maxHp: base.maxHp + per.maxHp * n,
    maxMana: base.maxMana + per.maxMana * n,
    attack: base.attack + per.attack * n,
    defense: base.defense + per.defense * n,
    speed: base.speed + per.speed * n,
  };
}

/** DB row → DTO. structuredClone: callers get copies, never the mock's own objects. */
function toCharacterDto(record: CharacterRecord): PlayerCharacterDto {
  return structuredClone({
    characterId: record.characterId,
    name: record.name,
    level: record.level,
    stats: statsFor(record.classId, record.level),
    classId: record.classId,
    xp: record.xp,
    xpToNextLevel: xpToNextLevel(record.level),
    skillPoints: record.skillPoints,
    learnedSkills: SEED_PLAYER_SKILLS.filter((s) => record.learnedSkillIds.includes(s.skillId)),
    createdAt: record.createdAt,
  });
}

function validateCharacterName(name: string): string[] {
  return lengthError('Name', name, 2, 20);
}

// ---- The mock API ----

export const mockApi: KeldrithApi = {
  auth: {
    async register({ username, email, password }) {
      await delay();
      throwIfInvalid({
        username: lengthError('Username', username, 3, 20),
        email: EMAIL_PATTERN.test(email) ? [] : ['Email is not valid.'],
        password: password.length >= 8 ? [] : ['Password must be at least 8 characters.'],
      });
      return updateDb((db) => {
        const sameName = (a: string, b: string) =>
          a.trim().toLowerCase() === b.trim().toLowerCase();
        if (db.users.some((u) => sameName(u.username, username))) {
          throw conflict('Username is already taken.');
        }
        if (db.users.some((u) => sameName(u.email, email))) {
          throw conflict('Email is already taken.');
        }
        const user: UserRecord = {
          userId: db.nextUserId++,
          username: username.trim(),
          email: email.trim(),
          password,
          role: 'User',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        return createAuthResponse(user);
      });
    },

    async login({ email, password }) {
      await delay();
      const user = readDb((db) =>
        db.users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        ),
      );
      if (!user) {
        // Same message for "unknown email" and "wrong password": nothing to find out.
        throw new ApiError(401, { status: 401, title: 'Invalid email or password.' });
      }
      return createAuthResponse(user);
    },

    async me(signal) {
      await delay(signal);
      return toUserDto(readDb(requireUser));
    },
  },

  classes: {
    async list(signal) {
      await delay(signal);
      return structuredClone([...SEED_CLASSES]);
    },

    async skills(classId, signal) {
      await delay(signal);
      if (!SEED_CLASSES.some((c) => c.classId === classId)) {
        throw notFound();
      }
      return structuredClone(SEED_PLAYER_SKILLS.filter((s) => s.classId === classId));
    },
  },

  monsters: {
    async list(signal) {
      await delay(signal);
      readDb(requireUser);
      return structuredClone([...SEED_MONSTERS]);
    },
  },

  characters: {
    async list(signal) {
      await delay(signal);
      return readDb((db) => {
        const user = requireUser(db);
        return db.characters.filter((c) => c.userId === user.userId).map(toCharacterDto);
      });
    },

    async get(characterId, signal) {
      await delay(signal);
      return readDb((db) =>
        toCharacterDto(findOwnCharacter(db, requireUser(db).userId, characterId)),
      );
    },

    async create({ name, classId }) {
      await delay();
      return updateDb((db) => {
        const user = requireUser(db);
        throwIfInvalid({
          name: validateCharacterName(name),
          classId: SEED_CLASSES.some((c) => c.classId === classId) ? [] : ['Class does not exist.'],
        });
        if (db.characters.some((c) => c.userId === user.userId)) {
          throw conflict('You already have a character.');
        }
        const character: CharacterRecord = {
          characterId: db.nextCharacterId++,
          userId: user.userId,
          name: name.trim(),
          classId,
          level: 1,
          xp: 0,
          skillPoints: 1,
          learnedSkillIds: [],
          createdAt: new Date().toISOString(),
        };
        db.characters.push(character);
        return toCharacterDto(character);
      });
    },

    async update(characterId, { name }) {
      await delay();
      return updateDb((db) => {
        const character = findOwnCharacter(db, requireUser(db).userId, characterId);
        throwIfInvalid({ name: validateCharacterName(name) });
        character.name = name.trim();
        return toCharacterDto(character);
      });
    },

    async delete(characterId) {
      await delay();
      updateDb((db) => {
        const character = findOwnCharacter(db, requireUser(db).userId, characterId);
        // Learned skills are part of the row, so they go with it (cascade).
        db.characters = db.characters.filter((c) => c !== character);
      });
    },

    async submitFightResult(characterId, { npcId, outcome, turns }) {
      await delay();
      return updateDb((db) => {
        const character = findOwnCharacter(db, requireUser(db).userId, characterId);
        const monster = SEED_MONSTERS.find((m) => m.npcId === npcId);
        throwIfInvalid({
          npcId: monster ? [] : ['Monster does not exist.'],
          outcome: FIGHT_OUTCOMES.includes(outcome) ? [] : ['Outcome must be Won, Lost or Fled.'],
          turns: Number.isInteger(turns) && turns >= 1 ? [] : ['Turns must be at least 1.'],
        });

        // XP only from the monster the server knows, never from the client.
        const startLevel = character.level;
        const xpGained =
          outcome === 'Won' && monster && character.level < MAX_LEVEL ? monster.xpReward : 0;
        character.xp += xpGained;
        // Several level-ups at once are possible.
        while (character.level < MAX_LEVEL && character.xp >= xpToNextLevel(character.level)) {
          character.xp -= xpToNextLevel(character.level);
          character.level += 1;
          character.skillPoints += 1;
        }
        if (character.level === MAX_LEVEL) {
          character.xp = 0; // no more XP at the max level
        }

        const levelsGained = character.level - startLevel;
        return {
          xpGained,
          leveledUp: levelsGained > 0,
          newLevel: character.level,
          skillPointsGained: levelsGained,
          character: toCharacterDto(character),
        };
      });
    },

    async learnSkill(characterId, { skillId }) {
      await delay();
      return updateDb((db) => {
        const character = findOwnCharacter(db, requireUser(db).userId, characterId);
        const skill = SEED_PLAYER_SKILLS.find(
          (s) => s.skillId === skillId && s.classId === character.classId,
        );
        if (!skill) {
          throw validationError({ skillId: ['Skill does not exist for this class.'] });
        }
        if (character.learnedSkillIds.includes(skillId)) {
          throw conflict('Skill is already learned.');
        }
        if (character.level < skill.requiredLevel) {
          throw validationError({ skillId: [`Requires level ${skill.requiredLevel}.`] });
        }
        if (character.skillPoints < skill.skillPointCost) {
          throw validationError({ skillId: ['Not enough skill points.'] });
        }
        character.skillPoints -= skill.skillPointCost;
        character.learnedSkillIds.push(skillId);
        return toCharacterDto(character);
      });
    },
  },
};
