import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { isApiError } from '../api/errors';
import type { LearnSkillRequest, PlayerCharacterDto } from '../api/types';
import { queryKeys } from '../lib/queryClient';

/**
 * POST /api/characters/{characterId}/skills: spends skill points to learn one skill.
 * The server checks every rule and answers with the complete updated character, which replaces
 * the cached one (same pattern as the fight reward): skill points, the top bar and the
 * learned skills update at once. Fights read `learnedSkills`, so the skill is there next time.
 */
export function useLearnSkill(characterId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LearnSkillRequest) => api.characters.learnSkill(characterId, request),
    onSuccess: (character) => {
      queryClient.setQueryData<PlayerCharacterDto | null>(queryKeys.myCharacter, character);
    },
    onError: (error) => {
      // 400 / 409: the server knows something our cached character does not (e.g. the points
      // were spent in another tab). Reload it, so the screen shows the real state again.
      if (isApiError(error) && (error.status === 400 || error.status === 409)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.myCharacter });
      }
    },
  });
}
