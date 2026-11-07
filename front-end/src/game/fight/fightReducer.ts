import type { MonsterDto, PlayerCharacterDto, SkillBase } from '../../api/types';
import { calculateDamage, calculateHeal, canUseSkill } from './calc';
import { createCombatant, getAttack } from './combatants';
import { getNextActor, scheduleNextAction, startTimeline } from './turnOrder';
import type {
  Combatant,
  FightAction,
  FightEvent,
  FightState,
  Rng,
  Side,
  TurnChoice,
} from './types';

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

function opponentOf(side: Side): Side {
  return side === 'player' ? 'monster' : 'player';
}

/** A copy of the list where only the combatant of `side` is replaced by `change(it)`. */
function updateSide(
  combatants: readonly Combatant[],
  side: Side,
  change: (combatant: Combatant) => Combatant,
): Combatant[] {
  return combatants.map((c) => (c.side === side ? change(c) : c));
}

/** What one chosen action changed: the new fighters and what happened (for the log). */
interface TurnOutcome {
  combatants: Combatant[];
  events: FightEvent[];
}

/** A normal attack (no skill, power 0) or a damage skill hitting the opponent. */
function resolveDamage(state: FightState, side: Side, rng: Rng, skill?: SkillBase): TurnOutcome {
  const attacker = getCombatant(state, side);
  const target = getCombatant(state, opponentOf(side));
  const amount = calculateDamage(
    {
      attack: getAttack(attacker),
      power: skill?.power ?? 0,
      defense: target.base.stats.defense,
      targetDefending: target.defending,
    },
    rng,
  );
  return {
    combatants: updateSide(state.combatants, target.side, (c) => ({
      ...c,
      hp: Math.max(0, c.hp - amount),
    })),
    events: [
      {
        type: 'damage',
        actor: side,
        target: target.side,
        amount,
        ...(skill && { skillName: skill.name }),
      },
    ],
  };
}

function resolveDefend(state: FightState, side: Side): TurnOutcome {
  return {
    combatants: updateSide(state.combatants, side, (c) => ({ ...c, defending: true })),
    events: [{ type: 'defend', actor: side }],
  };
}

/** Heals the caster itself, never above max HP. The event reports the HP really restored. */
function resolveHeal(state: FightState, side: Side, skill: SkillBase, rng: Rng): TurnOutcome {
  const caster = getCombatant(state, side);
  const amount = calculateHeal(skill.power, caster.hp, caster.base.stats.maxHp, rng);
  return {
    combatants: updateSide(state.combatants, side, (c) => ({ ...c, hp: c.hp + amount })),
    events: [{ type: 'heal', actor: side, amount, skillName: skill.name }],
  };
}

/** Raises the caster's attack by the skill's power for the rest of the fight. */
function resolveBuff(state: FightState, side: Side, skill: SkillBase): TurnOutcome {
  return {
    combatants: updateSide(state.combatants, side, (c) => ({
      ...c,
      attackBonus: c.attackBonus + skill.power,
    })),
    events: [{ type: 'buff', actor: side, attackGained: skill.power, skillName: skill.name }],
  };
}

/** Pays the mana, then applies the effect of the skill by its type. */
function resolveSkill(
  state: FightState,
  side: Side,
  skillId: string,
  rng: Rng,
): TurnOutcome | undefined {
  const caster = getCombatant(state, side);
  const skill = caster.skills.find((s) => s.skillId === skillId);
  if (skill === undefined || !canUseSkill(caster.mana, skill)) {
    return undefined;
  }

  const paid: FightState = {
    ...state,
    combatants: updateSide(state.combatants, side, (c) => ({
      ...c,
      mana: c.mana - skill.manaCost,
    })),
  };
  switch (skill.type) {
    case 'Damage':
      return resolveDamage(paid, side, rng, skill);
    case 'Heal':
      return resolveHeal(paid, side, skill, rng);
    case 'Buff':
      return resolveBuff(paid, side, skill);
  }
}

/** Plays out the choice. `undefined` means: not possible, nothing happens. */
function resolveChoice(
  state: FightState,
  side: Side,
  choice: TurnChoice,
  rng: Rng,
): TurnOutcome | undefined {
  switch (choice.type) {
    case 'attack':
      return resolveDamage(state, side, rng);
    case 'defend':
      return resolveDefend(state, side);
    case 'skill':
      return resolveSkill(state, side, choice.skillId, rng);
  }
}

/** One turn of one side: resolve the choice, then move the timeline on to the next actor. */
function takeTurn(state: FightState, side: Side, choice: TurnChoice, rng: Rng): FightState {
  // A defend from the last turn ends when the combatant acts again.
  const ready: FightState = {
    ...state,
    combatants: updateSide(state.combatants, side, (c) => ({ ...c, defending: false })),
  };
  const outcome = resolveChoice(ready, side, choice, rng);
  if (outcome === undefined) {
    return state;
  }

  const combatants = updateSide(outcome.combatants, side, scheduleNextAction);
  return {
    ...state,
    combatants,
    active: getNextActor(combatants)?.side ?? state.active,
    turn: state.turn + 1,
    log: [...state.log, ...outcome.events],
  };
}

export type FightReducer = (state: FightState, action: FightAction) => FightState;

/**
 * The reducer for `useReducer`. `rng` is injected: `Math.random` in the app, fixed numbers in tests.
 * It never changes the old state and never throws: an action that is not allowed right now
 * (wrong turn, fight over, ...) returns the very same state object.
 */
export function createFightReducer(rng: Rng): FightReducer {
  return (state, action) => {
    if (state.status !== 'Running') {
      return state;
    }
    switch (action.type) {
      case 'playerTurn':
        return state.active === 'player' ? takeTurn(state, 'player', action.choice, rng) : state;
      default:
        return state; // Monster turn and flee are not supported yet.
    }
  };
}
