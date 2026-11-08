import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuth } from '../auth/authContext';
import { queryKeys } from '../lib/queryClient';

/** GET /api/monsters (needs login): all monsters a hero can fight. The server owns this list. */
export function useMonsters() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.monsters,
    queryFn: ({ signal }) => api.monsters.list(signal),
    // Game data only changes with a server release: load once per session.
    staleTime: Infinity,
    // Only ask the server when someone is logged in.
    enabled: isAuthenticated,
  });
}
