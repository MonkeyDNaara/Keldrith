import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { queryKeys } from '../lib/queryClient';

/** GET /api/classes (public): all playable classes. The server owns this list. */
export function useClasses() {
  return useQuery({
    queryKey: queryKeys.classes,
    // TanStack Query passes { signal }: leaving the page cancels the request.
    queryFn: ({ signal }) => api.classes.list(signal),
    // Game data only changes with a server release: load once per session.
    staleTime: Infinity,
  });
}
