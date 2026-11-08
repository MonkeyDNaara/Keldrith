import { Link } from 'react-router';
import { useEffect, useId, useRef } from 'react';
import type { FightOutcome, FightRewardDto } from '../../api/types';
import { characterErrorMessage } from '../../character/applyCharacterError';
import { t } from '../../i18n';
import { FormAlert } from '../ui/FormAlert';
import { StatBar } from '../ui/StatBar';

interface FightResultDialogProps {
  characterId: number;
  outcome: FightOutcome;
  monsterName: string;
  /** The server's answer to the fight result. `undefined` until it arrives. */
  reward: FightRewardDto | undefined;
  isPending: boolean;
  /** Set when sending the result failed. */
  error: Error | null;
  onRetry: () => void;
  onFightAgain: () => void;
}

const texts = t.fight.result;

/** Headline and sentence for each way a fight can end. `Record` forces a text for every outcome. */
const OUTCOME_TEXTS: Record<FightOutcome, { title: string; text: (monster: string) => string }> = {
  Won: { title: texts.won, text: texts.wonText },
  Lost: { title: texts.lost, text: texts.lostText },
  Fled: { title: texts.fled, text: texts.fledText },
};

/**
 * Shown as soon as a fight is over: waits for the server's reward, then shows XP, level-up and
 * skill points. Render it only for a finished fight; it opens itself as a native modal <dialog>.
 * Esc does not close it: the player leaves with one of the buttons.
 */
export function FightResultDialog({
  characterId,
  outcome,
  monsterName,
  reward,
  isPending,
  error,
  onRetry,
  onFightAgain,
}: FightResultDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
    }
    // Cleanup: the dialog is removed together with the component; StrictMode also runs this once.
    return () => dialog.close();
  }, []);

  const { title, text } = OUTCOME_TEXTS[outcome];

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      // Esc fires "cancel": there is no way back into the finished fight, so keep the dialog.
      onCancel={(event) => event.preventDefault()}
    >
      <div className="modal-box flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-2xl">
            {title}
          </h2>
          <p className="text-muted">{text(monsterName)}</p>
        </div>

        {/* aria-live: the change from "reporting" to the reward is announced. */}
        <div className="flex flex-col gap-3" aria-live="polite">
          {isPending && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="loading loading-sm loading-spinner" aria-hidden="true" />
              {texts.reporting}
            </p>
          )}

          {error !== null && !isPending && <FormAlert>{characterErrorMessage(error)}</FormAlert>}

          {reward && (
            <>
              <p className="text-lg font-semibold">
                {reward.xpGained > 0 ? texts.xpGained(reward.xpGained) : texts.noXp}
              </p>
              {reward.leveledUp && <p className="text-accent">{texts.levelUp(reward.newLevel)}</p>}
              {reward.skillPointsGained > 0 && (
                <p className="text-sm">{texts.skillPointsGained(reward.skillPointsGained)}</p>
              )}
              <StatBar
                label={t.character.xp}
                value={reward.character.xp}
                max={reward.character.xpToNextLevel}
                color="xp"
              />
            </>
          )}
        </div>

        <div className="modal-action mt-0 flex-wrap">
          {error !== null && !isPending && (
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              {texts.retry}
            </button>
          )}
          {!isPending && (
            <Link to={`/characters/${characterId}`} className="btn btn-outline">
              {texts.backToHero}
            </Link>
          )}
          {reward && (
            <button type="button" className="btn btn-primary" onClick={onFightAgain}>
              {texts.fightAgain}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
