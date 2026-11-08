import { useEffect, type Dispatch } from 'react';
import type { FightAction, FightState } from '../game/fight';

/** Pause before the monster acts, so the player can follow what happens (UI timing, not a rule). */
export const MONSTER_TURN_DELAY_MS = 700;

/**
 * Lets the monster play its turns: whenever it is the monster's turn in a running fight,
 * `monsterTurn` is dispatched after a short delay. The engine picks the action itself.
 */
export function useMonsterTurns(
  state: FightState,
  dispatch: Dispatch<FightAction>,
  delayMs: number = MONSTER_TURN_DELAY_MS,
) {
  const { status, active, turn } = state;

  useEffect(() => {
    if (status !== 'Running' || active !== 'monster') {
      return;
    }
    const timer = setTimeout(() => dispatch({ type: 'monsterTurn' }), delayMs);
    // Cleanup: leaving the page or a new state cancels the pending turn.
    return () => clearTimeout(timer);
    // `turn` is a dependency on purpose: the monster may act several times in a row
    // (speed timeline), and `active` alone would not change between those turns.
  }, [status, active, turn, dispatch, delayMs]);
}
