import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { PlayerCharacterDto } from '../../api/types';
import { applyCharacterError } from '../../character/applyCharacterError';
import {
  CHARACTER_RULES,
  characterNameSchema,
  type CharacterNameFormValues,
} from '../../character/characterSchemas';
import { useRenameCharacter } from '../../hooks/useCharacterMutations';
import { t } from '../../i18n';
import { FormAlert } from '../ui/FormAlert';
import { FormField } from '../ui/FormField';
import { SubmitButton } from '../ui/SubmitButton';

interface RenameCharacterFormProps {
  character: Pick<PlayerCharacterDto, 'characterId' | 'name'>;
}

/** The hero's name as page heading; the pencil switches to an inline form in the same place. */
export function RenameCharacterForm({ character }: RenameCharacterFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  // Only move focus after closing the form, not on the first render of the page.
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!isEditing && restoreFocus.current) {
      restoreFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  function close() {
    restoreFocus.current = true;
    setIsEditing(false);
  }

  if (isEditing) {
    return <NameForm character={character} onDone={close} />;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <h1 className="truncate text-3xl">{character.name}</h1>
      <button
        ref={editButtonRef}
        type="button"
        className="btn btn-square btn-ghost btn-sm"
        aria-label={t.character.rename}
        title={t.character.rename}
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

interface NameFormProps {
  character: RenameCharacterFormProps['character'];
  onDone: () => void;
}

/** Own component: it mounts fresh on every "edit", so the form always starts with the current name. */
function NameForm({ character, onDone }: NameFormProps) {
  const rename = useRenameCharacter(character.characterId);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CharacterNameFormValues>({
    resolver: zodResolver(characterNameSchema),
    defaultValues: { name: character.name },
  });

  async function onSubmit({ name }: CharacterNameFormValues) {
    // Nothing changed → no request.
    if (name === character.name) {
      onDone();
      return;
    }
    try {
      await rename.mutateAsync({ name });
      onDone();
    } catch (error) {
      applyCharacterError(error, setError);
    }
  }

  // Esc = cancel, as users know it from inline edits.
  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Escape' && !isSubmitting) {
      onDone();
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={onKeyDown}
      className="flex w-full max-w-md flex-col gap-3"
    >
      {errors.root?.server && <FormAlert>{errors.root.server.message}</FormAlert>}

      <FormField
        label={t.character.name}
        autoComplete="off"
        autoFocus
        maxLength={CHARACTER_RULES.nameMax}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex gap-2">
        <SubmitButton
          label={t.character.save}
          pendingLabel={t.character.saving}
          isPending={isSubmitting}
          className="btn-sm"
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={isSubmitting}
          onClick={onDone}
        >
          {t.character.cancel}
        </button>
      </div>
    </form>
  );
}
