import type { MonsterDto, PlayerCharacterDto } from '../../api/types';
import { createCombatant } from './combatants';
import { getNextActor, startTimeline } from './turnOrder';
import type { Combatant, FightState, Side } from './types';

/**
 * Starts a fight: both fighters at full HP and mana, put on the turn timeline.
 * The faster one is `active` first (a tie goes to the player).
 */
export function createFight(player: PlayerCharacterDto, monster: MonsterDto): FightState {
  const combatants = startTimeline([
    createCombatant('player', player, player.learnedSkills),
    createCombatant('monster', monster, monster.skills),
  ]);

  return {
    combatants,
    // Both start alive, so there is always a next actor; the fallback only satisfies the types.
    active: getNextActor(combatants)?.side ?? 'player',
    turn: 0,
    status: 'Running',
    log: [],
  };
}

/** The combatant of one side. A fight always has both, so a missing one is a programming error. */
export function getCombatant(state: FightState, side: Side): Combatant {
  const found = state.combatants.find((c) => c.side === side);
  if (found === undefined) {
    throw new Error(`No combatant on side "${side}"`);
  }
  return found;
}
