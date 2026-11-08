import { useEffect, useRef } from 'react';
import type { FightEvent } from '../../game/fight';
import { t } from '../../i18n';
import { describeFightEvent, type FightNames } from './fightLogText';

interface FightLogProps {
  events: readonly FightEvent[];
  names: FightNames;
}

/** The fight so far, one sentence per event. Scrolls down by itself when something happens. */
export function FightLog({ events, names }: FightLogProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [events.length]);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg">{t.fight.log.title}</h2>
      {/* role="log": screen readers announce new entries politely (without interrupting). */}
      <ol
        ref={listRef}
        role="log"
        aria-label={t.fight.log.title}
        className="flex max-h-56 min-h-24 flex-col gap-1 overflow-y-auto rounded-box border border-line bg-base-200 p-3 text-sm"
      >
        <li className="text-faint">{t.fight.log.start}</li>
        {/* The log only grows at the end and is never reordered, so the index is a safe key. */}
        {events.map((event, index) => (
          <li key={index} className={event.type === 'defeated' ? 'font-semibold' : undefined}>
            {describeFightEvent(event, names)}
          </li>
        ))}
      </ol>
    </section>
  );
}
