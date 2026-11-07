import type { PlayerCharacterDto } from '../../api/types';
import type { Rng } from './types';

/** An rng that always returns the same number (0 = lowest roll, 0.5 = middle, 0.999 = highest). */
export function fixedRng(value: number): Rng {
  return () => value;
}

/**
 * An rng that returns the given numbers one after another.
 * It throws when the code asks for more numbers than the test planned,
 * so an unexpected extra random roll fails the test instead of passing by luck.
 */
export function sequenceRng(values: readonly number[]): Rng {
  let index = 0;
  return () => {
    if (index >= values.length) {
      throw new Error(
        `sequenceRng: only ${values.length} value(s) planned, but another was requested`,
      );
    }
    return values[index++];
  };
}

/** A level 1 warrior with the seed stats and no skills. Override what a test needs. */
export function makePlayer(changes: Partial<PlayerCharacterDto> = {}): PlayerCharacterDto {
  return {
    characterId: 1,
    name: 'Aldric',
    level: 1,
    stats: { maxHp: 120, maxMana: 30, attack: 14, defense: 10, speed: 8 },
    classId: 'warrior',
    xp: 0,
    xpToNextLevel: 100,
    skillPoints: 1,
    learnedSkills: [],
    createdAt: '2026-11-07T10:00:00Z',
    ...changes,
  };
}
