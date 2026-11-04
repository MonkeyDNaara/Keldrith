import type { KeldrithApi } from './api';
import { client } from './client';
import type {
  AuthResponse,
  ClassDto,
  FightRewardDto,
  MonsterDto,
  PlayerCharacterDto,
  PlayerSkillDto,
  UserDto,
} from './types';

/** Slugs come from the server, but never trust text inside a URL: encode it. */
const segment = (value: string) => encodeURIComponent(value);

/** The real back-end. Each method maps 1:1 to one endpoint of the API contract. */
export const httpApi: KeldrithApi = {
  auth: {
    register: (request) => client.post<AuthResponse>('/auth/register', request),
    login: (request) => client.post<AuthResponse>('/auth/login', request),
    me: (signal) => client.get<UserDto>('/auth/me', signal),
  },

  classes: {
    list: (signal) => client.get<ClassDto[]>('/classes', signal),
    skills: (classId, signal) =>
      client.get<PlayerSkillDto[]>(`/classes/${segment(classId)}/skills`, signal),
  },

  monsters: {
    list: (signal) => client.get<MonsterDto[]>('/monsters', signal),
  },

  characters: {
    list: (signal) => client.get<PlayerCharacterDto[]>('/characters', signal),
    get: (characterId, signal) =>
      client.get<PlayerCharacterDto>(`/characters/${characterId}`, signal),
    create: (request) => client.post<PlayerCharacterDto>('/characters', request),
    update: (characterId, request) =>
      client.put<PlayerCharacterDto>(`/characters/${characterId}`, request),
    delete: (characterId) => client.delete(`/characters/${characterId}`),
    submitFightResult: (characterId, request) =>
      client.post<FightRewardDto>(`/characters/${characterId}/fight-results`, request),
    learnSkill: (characterId, request) =>
      client.post<PlayerCharacterDto>(`/characters/${characterId}/skills`, request),
  },
};
