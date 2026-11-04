import type { UserDto } from '../types';

/**
 * The mock "database": users and characters, kept in memory and saved to localStorage,
 * so data survives a reload. Game data (classes, skills, monsters) is read-only in seed.ts.
 * Rows look like the back-end tables, not like the DTOs: mockApi.ts maps rows → DTOs.
 */

/** Mock only: the password is stored in plain text. Never use a real password here. */
export interface UserRecord extends UserDto {
  password: string;
  createdAt: string;
}

export interface CharacterRecord {
  characterId: number;
  userId: number;
  name: string;
  classId: string;
  level: number;
  /** XP within the current level */
  xp: number;
  skillPoints: number;
  learnedSkillIds: string[];
  createdAt: string;
}

export interface MockDbState {
  /** Bump when the shape changes: an old saved state is then replaced by the seed. */
  version: number;
  nextUserId: number;
  nextCharacterId: number;
  users: UserRecord[];
  characters: CharacterRecord[];
}

const STORAGE_KEY = 'keldrith-mock-db';
const DB_VERSION = 1;

/** Demo login for development and the presentation. */
export const DEMO_ACCOUNT = { email: 'demo@keldrith.dev', password: 'demo-password' } as const;

function createInitialState(): MockDbState {
  return {
    version: DB_VERSION,
    nextUserId: 2,
    nextCharacterId: 8,
    users: [
      {
        userId: 1,
        username: 'demo',
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password,
        role: 'User',
        createdAt: '2026-11-03T09:00:00Z',
      },
    ],
    characters: [
      {
        characterId: 7,
        userId: 1,
        name: 'Aldric',
        classId: 'warrior',
        level: 3,
        xp: 40,
        // Level 3 = 3 points (1 at start + 1 per level-up); Shield Bash cost 1.
        skillPoints: 2,
        learnedSkillIds: ['shield-bash'],
        createdAt: '2026-11-03T09:12:00Z',
      },
    ],
  };
}

function load(): MockDbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isMockDbState(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Blocked storage or broken JSON: start from the seed.
  }
  return createInitialState();
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: data lives until the next reload.
  }
}

/** Shape check for saved data (untrusted: old version, edited by hand). */
function isMockDbState(value: unknown): value is MockDbState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const db = value as MockDbState;
  return db.version === DB_VERSION && Array.isArray(db.users) && Array.isArray(db.characters);
}

// Module state: loaded once when the module is first imported.
let state: MockDbState = load();

/** Read without changing anything. */
export function readDb<T>(read: (db: Readonly<MockDbState>) => T): T {
  return read(state);
}

/** Change the data; it is saved afterwards in one go (like a small transaction). */
export function updateDb<T>(change: (db: MockDbState) => T): T {
  const result = change(state);
  save();
  return result;
}

/** Back to the seed: demo account only. For development (e.g. from the styleguide page). */
export function resetMockDb(): void {
  state = createInitialState();
  save();
}
