import { skipToken, useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { queryKeys } from '../lib/queryClient';

/**
 * GET /api/classes/{classId}/skills (public): every skill of one class.
 * Pass `undefined` while the class is not known yet (e.g. the character still loads):
 * `skipToken` keeps the query switched off until there is an id.
 */
export function useClassSkills(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.classSkills(classId ?? ''),
    // TanStack Query passes { signal }: leaving the page cancels the request.
    queryFn:
      classId === undefined ? skipToken : ({ signal }) => api.classes.skills(classId, signal),
    // Game data only changes with a server release: load once per session.
    staleTime: Infinity,
  });
}
