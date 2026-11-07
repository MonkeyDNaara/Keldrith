import type { CharacterBase, FightOutcome, SkillBase } from '../../api/types';

/** Returns a number in [0, 1), exactly like `Math.random`. Injected, so tests are deterministic. */
export type Rng = () => number;

/** Who a combatant is. Fights are 1 vs 1 for now. */
export type Side = 'player' | 'monster';

/** One fighter during a fight: the unchanging data (`base`) plus everything that changes. */
export interface Combatant {
  side: Side;
  /** Name, level and stats as the API sent them. Never changed during the fight. */
  base: CharacterBase;
  /** Player skills and monster skills both extend `SkillBase`, so one type fits both. */
  skills: readonly SkillBase[];
  hp: number;
  mana: number;
  /** True from a defend action until the combatant's next turn. */
  defending: boolean;
  /** Added to `attack` (from buff skills). */
  attackBonus: number;
  /** Added to `speed` (room for future haste / slow effects). */
  speedBonus: number;
  /** Point on the turn timeline where this combatant acts next. Smallest value goes first. */
  nextActionAt: number;
}

/** `Running` while the fight goes on, otherwise the same outcome the API expects. */
export type FightStatus = 'Running' | FightOutcome;

/** What a combatant can choose on its turn (both sides). */
export type TurnChoice =
  { type: 'attack' } | { type: 'defend' } | { type: 'skill'; skillId: string };

/** Everything the UI can dispatch to the reducer. */
export type FightAction =
  { type: 'playerTurn'; choice: TurnChoice } | { type: 'flee' } | { type: 'monsterTurn' };

/**
 * What happened, as data. The UI turns it into text (i18n), the tests compare it exactly.
 * `skillName` is set when a skill caused the event, a normal attack has none.
 */
export type FightEvent =
  | { type: 'damage'; actor: Side; target: Side; amount: number; skillName?: string }
  | { type: 'heal'; actor: Side; amount: number; skillName: string }
  | { type: 'buff'; actor: Side; attackGained: number; skillName: string }
  | { type: 'defend'; actor: Side }
  | { type: 'fled'; actor: Side }
  | { type: 'defeated'; side: Side };

export interface FightState {
  /** An array on purpose: the turn order is derived from it, so more fighters fit later. */
  combatants: readonly Combatant[];
  /** Whose turn it is (derived from the timeline after every action). */
  active: Side;
  /** Number of actions taken by both sides so far (this is `turns` for the API). */
  turn: number;
  status: FightStatus;
  log: readonly FightEvent[];
}
