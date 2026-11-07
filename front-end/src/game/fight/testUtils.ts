import type { Rng } from './types';

/** An rng that always returns the same number (0 = lowest roll, 0.5 = middle, 0.999 = highest). */
export function fixedRng(value: number): Rng {
  return () => value;
}
