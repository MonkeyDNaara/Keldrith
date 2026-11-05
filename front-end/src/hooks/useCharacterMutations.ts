import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { isApiError } from '../api/errors';
import type {
  CreateCharacterRequest,
  PlayerCharacterDto,
  UpdateCharacterRequest,
} from '../api/types';
import { queryKeys } from '../lib/queryClient';

/**
 * Writes for the one character of the user. Each hook puts the server's answer into the
 * myCharacter cache, so the top bar, home redirect and detail page update at once (no refetch).
 * Navigation stays in the pages: a hook does not know where the user should go next.
 */

/** POST /api/characters → 201. */
export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCharacterRequest) => api.characters.create(request),
    onSuccess: (character) => {
      queryClient.setQueryData<PlayerCharacterDto | null>(queryKeys.myCharacter, character);
    },
    onError: (error) => {
      // 409: a character exists that our cache does not know (e.g. created in another tab).
      if (isApiError(error) && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.myCharacter });
      }
    },
  });
}

/** PUT /api/characters/{characterId} (name only). */
export function useRenameCharacter(characterId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCharacterRequest) => api.characters.update(characterId, request),
    onSuccess: (character) => {
      queryClient.setQueryData<PlayerCharacterDto | null>(queryKeys.myCharacter, character);
    },
  });
}

/** DELETE /api/characters/{characterId} → 204. */
export function useDeleteCharacter(characterId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.characters.delete(characterId),
    onSuccess: () => {
      // null = "user has no character" (same value useMyCharacter returns for an empty list).
      queryClient.setQueryData<PlayerCharacterDto | null>(queryKeys.myCharacter, null);
    },
  });
}
