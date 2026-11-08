import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { FightResultRequest, MonsterDto, PlayerCharacterDto } from '../../api/types';
import { useMonsterTurns } from '../../hooks/useMonsterTurns';
import { useSubmitFightResult } from '../../hooks/useSubmitFightResult';
import {
  createFight,
  createFightReducer,
  getCombatant,
  type FightState,
  type TurnChoice,
} from '../../game/fight';
import { ActionBar, type FightPhase } from './ActionBar';
import { CombatantPanel } from './CombatantPanel';
import { FightLog } from './FightLog';
import { FightResultDialog } from './FightResultDialog';
import { TurnTimeline } from './TurnTimeline';

interface FightArenaProps {
  character: PlayerCharacterDto;
  monster: MonsterDto;
  /** Display name of the hero's class (ClassDto.name); without it the badge shows the id. */
  classDisplayName?: string;
  /** Back to the monster list for the next fight. */
  onFightAgain: () => void;
}

// Created once for the whole app: the reducer only needs the random number source.
const fightReducer = createFightReducer(Math.random);

function getPhase(state: FightState): FightPhase {
  if (state.status !== 'Running') return 'over';
  return state.active === 'player' ? 'player' : 'monster';
}

/**
 * One fight from start to reward. Owns the fight state (`useReducer`) and wires the engine to
 * the UI: the player's buttons dispatch actions, a timer lets the monster act, and when the
 * fight is over the outcome goes to the server exactly once.
 *
 * The fight starts with the `character` and `monster` it gets on mount. Later changes of those
 * props (e.g. the new XP after the reward) do not touch a fight in progress. Mount it with a
 * `key` per fight, so every new fight starts from fresh state.
 */
export function FightArena({
  character,
  monster,
  classDisplayName,
  onFightAgain,
}: FightArenaProps) {
  const [state, dispatch] = useReducer(fightReducer, undefined, () =>
    createFight(character, monster),
  );
  useMonsterTurns(state, dispatch);

  const { mutate, data: reward, isPending, error } = useSubmitFightResult(character.characterId);

  // What the server gets: only the outcome, never XP or loot. `null` while the fight runs.
  const request = useMemo<FightResultRequest | null>(
    () =>
      state.status === 'Running'
        ? null
        : { npcId: monster.npcId, outcome: state.status, turns: state.turn },
    [state.status, state.turn, monster.npcId],
  );

  // A ref (not state) remembers "already sent": it survives StrictMode's test re-run of effects
  // and never causes a render. Retrying after an error is a separate, deliberate click.
  const sent = useRef(false);
  useEffect(() => {
    if (request === null || sent.current) {
      return;
    }
    sent.current = true;
    mutate(request);
  }, [request, mutate]);

  const player = getCombatant(state, 'player');
  const opponent = getCombatant(state, 'monster');
  const names = { player: player.base.name, monster: opponent.base.name };

  function choose(choice: TurnChoice) {
    dispatch({ type: 'playerTurn', choice });
  }

  return (
    <div className="flex flex-col gap-6">
      {state.status === 'Running' && <TurnTimeline combatants={state.combatants} />}

      <div className="grid gap-4 md:grid-cols-2">
        <CombatantPanel
          combatant={player}
          isActive={state.status === 'Running' && state.active === 'player'}
          classId={character.classId}
          classDisplayName={classDisplayName}
        />
        <CombatantPanel
          combatant={opponent}
          isActive={state.status === 'Running' && state.active === 'monster'}
        />
      </div>

      <ActionBar
        player={player}
        phase={getPhase(state)}
        onChoose={choose}
        onFlee={() => dispatch({ type: 'flee' })}
      />

      <FightLog events={state.log} names={names} />

      {state.status !== 'Running' && (
        <FightResultDialog
          characterId={character.characterId}
          outcome={state.status}
          monsterName={monster.name}
          reward={reward}
          isPending={isPending}
          error={error}
          onRetry={() => request && mutate(request)}
          onFightAgain={onFightAgain}
        />
      )}
    </div>
  );
}
