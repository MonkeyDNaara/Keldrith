import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { FightResultRequest, PlayerCharacterDto } from '../api/types';
import { queryKeys } from '../lib/queryClient';

/**
 * POST /api/characters/{characterId}/fight-results: reports how a fight ended.
 * The server decides XP, level-ups and skill points; its answer holds the reward and the
 * complete updated character, which replaces the cached one (top bar and pages update at once).
 * Showing the reward is up to the caller: it reads `data` from the returned mutation.
 */
export function useSubmitFightResult(characterId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: FightResultRequest) =>
      api.characters.submitFightResult(characterId, request),
    onSuccess: (reward) => {
      queryClient.setQueryData<PlayerCharacterDto | null>(queryKeys.myCharacter, reward.character);
    },
  });
}
