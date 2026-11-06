import { Trash2 } from 'lucide-react';
import { useId, useRef, type SyntheticEvent } from 'react';
import { characterErrorMessage } from '../../character/applyCharacterError';
import { useDeleteCharacter } from '../../hooks/useCharacterMutations';
import { t } from '../../i18n';
import { FormAlert } from '../ui/FormAlert';

interface DeleteCharacterDialogProps {
  characterId: number;
  characterName: string;
}

/**
 * "Delete hero" button + confirmation in a native <dialog>.
 * showModal() gives us for free: backdrop, focus trap, Esc to close, focus back to the button.
 * After success the cache says "no character" and the page redirects (no navigate() here).
 */
export function DeleteCharacterDialog({ characterId, characterName }: DeleteCharacterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const remove = useDeleteCharacter(characterId);

  function open() {
    // Forget the error of an earlier attempt.
    remove.reset();
    dialogRef.current?.showModal();
  }

  // Esc fires "cancel": keep the dialog open while the request runs.
  function onCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (remove.isPending) {
      event.preventDefault();
    }
  }

  return (
    <>
      <button type="button" className="btn btn-outline btn-error btn-sm" onClick={open}>
        <Trash2 className="size-4" aria-hidden="true" />
        {t.character.delete}
      </button>

      <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} onCancel={onCancel}>
        <div className="modal-box flex flex-col gap-4">
          <h2 id={titleId} className="text-xl">
            {t.character.deleteTitle(characterName)}
          </h2>
          <p className="text-muted">{t.character.deleteText}</p>

          {remove.isError && <FormAlert>{characterErrorMessage(remove.error)}</FormAlert>}

          <div className="modal-action mt-0">
            {/* method="dialog": the button closes the dialog without JavaScript. First in the DOM
                = focused first by showModal(), so Enter never deletes by accident. */}
            <form method="dialog">
              <button type="submit" className="btn btn-ghost" disabled={remove.isPending}>
                {t.character.cancel}
              </button>
            </form>
            <button
              type="button"
              className="btn btn-error"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending && (
                <span className="loading loading-sm loading-spinner" aria-hidden="true" />
              )}
              {remove.isPending ? t.character.deleting : t.character.deleteConfirm}
            </button>
          </div>
        </div>

        {/* daisyUI: a click on the dark backdrop closes the dialog too. */}
        <form method="dialog" className="modal-backdrop">
          <button type="submit" disabled={remove.isPending}>
            {t.character.closeDialog}
          </button>
        </form>
      </dialog>
    </>
  );
}
