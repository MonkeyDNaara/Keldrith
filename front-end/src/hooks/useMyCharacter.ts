import { useQuery } from '@tanstack/react-query';
import type { PlayerCharacterDto } from '../api/types';
import { useAuth } from '../auth/authContext';
import { queryKeys } from '../lib/queryClient';

// TODO(#10): replace with the API client (GET /api/characters → 0 or 1 items).
// Set MOCK_HAS_CHARACTER to false to test the "no character yet" flow.
const MOCK_HAS_CHARACTER = true;
const MOCK_DELAY_MS = 300;

const MOCK_CHARACTER: PlayerCharacterDto = {
  characterId: 7,
  name: 'Aldric',
  level: 3,
  stats: { maxHp: 144, maxMana: 36, attack: 18, defense: 14, speed: 10 },
  classId: 'warrior',
  xp: 40,
  xpToNextLevel: 200,
  skillPoints: 1,
  learnedSkills: [],
  createdAt: '2026-11-03T09:12:00Z',
};

async function fetchMyCharacterMock(): Promise<PlayerCharacterDto | null> {
  // Fake network delay, so loading states are visible during development.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const characters = MOCK_HAS_CHARACTER ? [MOCK_CHARACTER] : [];
  // One character per user: the list has 0 or 1 items.
  return characters[0] ?? null;
}

/** The logged-in user's character, or null if they have none yet. */
export function useMyCharacter() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.myCharacter,
    queryFn: fetchMyCharacterMock,
    // Only ask the server when someone is logged in.
    enabled: isAuthenticated,
  });
}
