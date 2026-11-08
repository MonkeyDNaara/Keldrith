import type { FightEvent, Side } from '../../game/fight';
import { t } from '../../i18n';

/** Display names of both sides (the engine only knows `'player'` and `'monster'`). */
export type FightNames = Record<Side, string>;

const texts = t.fight.log;

/**
 * Turns one engine event (data) into a sentence. The engine never produces text, so the
 * wording lives in `i18n/en.ts` and a second language needs no change in the engine.
 * The `switch` covers every event type: adding a new one in the engine fails to compile here.
 */
export function describeFightEvent(event: FightEvent, names: FightNames): string {
  switch (event.type) {
    case 'damage':
      return texts.damage(names[event.actor], names[event.target], event.amount, event.skillName);
    case 'heal':
      return texts.heal(names[event.actor], event.amount, event.skillName);
    case 'buff':
      return texts.buff(names[event.actor], event.attackGained, event.skillName);
    case 'defend':
      return texts.defend(names[event.actor]);
    case 'fled':
      return texts.fled(names[event.actor]);
    case 'defeated':
      return texts.defeated(names[event.side]);
  }
}
