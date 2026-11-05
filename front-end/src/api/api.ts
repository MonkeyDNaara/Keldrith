import type {
  AuthResponse,
  ClassDto,
  CreateCharacterRequest,
  FightResultRequest,
  FightRewardDto,
  LearnSkillRequest,
  LoginRequest,
  MonsterDto,
  PlayerCharacterDto,
  PlayerSkillDto,
  RegisterRequest,
  UpdateCharacterRequest,
  UserDto,
} from './types';

/**
 * Everything the front-end can ask the server, grouped by resource.
 * Two implementations: httpApi (real back-end) and mockApi (in the browser).
 * Both must behave the same: resolve with the DTO, or reject with an ApiError.
 * Read methods take an optional AbortSignal, so TanStack Query can cancel them.
 */
export interface KeldrithApi {
  auth: {
    /** POST /api/auth/register → 201. 400 invalid fields · 409 username or email taken. */
    register(request: RegisterRequest): Promise<AuthResponse>;
    /** POST /api/auth/login → 200. 401 wrong email or password. */
    login(request: LoginRequest): Promise<AuthResponse>;
    /** GET /api/auth/me → the user behind the saved token. 401 token missing or expired. */
    me(signal?: AbortSignal): Promise<UserDto>;
  };

  classes: {
    /** GET /api/classes (public) */
    list(signal?: AbortSignal): Promise<ClassDto[]>;
    /** GET /api/classes/{classId}/skills (public). 404 unknown class. */
    skills(classId: string, signal?: AbortSignal): Promise<PlayerSkillDto[]>;
  };

  monsters: {
    /** GET /api/monsters */
    list(signal?: AbortSignal): Promise<MonsterDto[]>;
  };

  characters: {
    /** GET /api/characters → 0 or 1 items (one character per user). */
    list(signal?: AbortSignal): Promise<PlayerCharacterDto[]>;
    /** GET /api/characters/{characterId}. 404 missing or not yours. */
    get(characterId: number, signal?: AbortSignal): Promise<PlayerCharacterDto>;
    /** POST /api/characters → 201. 400 invalid name or class · 409 already has a character. */
    create(request: CreateCharacterRequest): Promise<PlayerCharacterDto>;
    /** PUT /api/characters/{characterId} (name only). 400 · 404. */
    update(characterId: number, request: UpdateCharacterRequest): Promise<PlayerCharacterDto>;
    /** DELETE /api/characters/{characterId} → 204. 404. */
    delete(characterId: number): Promise<void>;
    /** POST /api/characters/{characterId}/fight-results. The server decides the reward. */
    submitFightResult(characterId: number, request: FightResultRequest): Promise<FightRewardDto>;
    /** POST /api/characters/{characterId}/skills. 400 rule broken · 409 already learned. */
    learnSkill(characterId: number, request: LearnSkillRequest): Promise<PlayerCharacterDto>;
  };
}
