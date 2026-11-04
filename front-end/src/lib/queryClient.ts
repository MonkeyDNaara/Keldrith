import { QueryClient } from '@tanstack/react-query';

/** One cache for all server data in the app (provided in main.tsx). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data counts as fresh for 30 s: switching pages does not refetch every time.
      staleTime: 30_000,
      // Retry a failed request once (default: 3). TODO(#10): no retry for 4xx errors.
      retry: 1,
      // Game data does not change in other tabs; avoids surprise reloads in the demo.
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * All query keys in one place. A key identifies cached data; the same key = the same cache entry.
 * After a fight we invalidate queryKeys.myCharacter, so every component shows the new XP.
 */
export const queryKeys = {
  myCharacter: ['characters', 'mine'] as const,
};
