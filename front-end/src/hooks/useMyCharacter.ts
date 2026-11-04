import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { PlayerCharacterDto } from '../api/types';
import { useAuth } from '../auth/authContext';
import { queryKeys } from '../lib/queryClient';

/** GET /api/characters → 0 or 1 items (one character per user). */
async function fetchMyCharacter({
  signal,
}: {
  signal: AbortSignal;
}): Promise<PlayerCharacterDto | null> {
  const characters = await api.characters.list(signal);
  return characters[0] ?? null;
}

/** The logged-in user's character, or null if they have none yet. */
export function useMyCharacter() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.myCharacter,
    queryFn: fetchMyCharacter,
    // Only ask the server when someone is logged in.
    enabled: isAuthenticated,
  });
}
