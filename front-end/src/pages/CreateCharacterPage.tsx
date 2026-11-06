import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router';
import type { ClassDto } from '../api/types';
import { ALREADY_HAS_CHARACTER, applyCharacterError } from '../character/applyCharacterError';
import {
  CHARACTER_RULES,
  characterNameSchema,
  toCreateCharacterRequest,
  type CharacterNameFormValues,
} from '../character/characterSchemas';
import { ClassCard } from '../components/character/ClassCard';
import { ClassBadge } from '../components/ui/ClassBadge';
import { FormAlert } from '../components/ui/FormAlert';
import { FormField } from '../components/ui/FormField';
import { PageSpinner } from '../components/ui/PageSpinner';
import { SubmitButton } from '../components/ui/SubmitButton';
import { useCreateCharacter } from '../hooks/useCharacterMutations';
import { useClasses } from '../hooks/useClasses';
import { useMyCharacter } from '../hooks/useMyCharacter';
import { t } from '../i18n';

type WizardStep = 'class' | 'name';

const texts = t.pages.createCharacter;

/** Wizard: 1. pick a class → 2. enter a name → create. One character per user. */
export function CreateCharacterPage() {
  const { data: character, isPending: isCharacterPending } = useMyCharacter();
  const classes = useClasses();
  const [step, setStep] = useState<WizardStep>('class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  if (isCharacterPending) {
    return <PageSpinner />;
  }

  // Already has a hero (also right after creating one: the mutation fills the cache).
  if (character) {
    return <Navigate to={`/characters/${character.characterId}`} replace />;
  }

  if (classes.isPending) {
    return <PageSpinner />;
  }

  if (classes.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{texts.loadClassesError}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => classes.refetch()}>
          {texts.retry}
        </button>
      </div>
    );
  }

  const selectedClass = classes.data.find((c) => c.classId === selectedClassId);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl">{texts.title}</h1>

      <ul className="steps w-full max-w-sm" aria-label={texts.steps}>
        <li className="step step-primary">{texts.stepClass}</li>
        <li
          className={`step ${step === 'name' ? 'step-primary' : ''}`}
          aria-current={step === 'name' ? 'step' : undefined}
        >
          {texts.stepName}
        </li>
      </ul>

      {step === 'name' && selectedClass ? (
        <NameStep playerClass={selectedClass} onBack={() => setStep('class')} />
      ) : (
        <ClassStep
          classes={classes.data}
          selectedClassId={selectedClassId}
          onSelect={setSelectedClassId}
          onNext={() => setStep('name')}
        />
      )}
    </section>
  );
}

interface ClassStepProps {
  classes: ClassDto[];
  selectedClassId: string | null;
  onSelect: (classId: string) => void;
  onNext: () => void;
}

/** Step 1: one radio group of class cards. */
function ClassStep({ classes, selectedClassId, onSelect, onNext }: ClassStepProps) {
  const groupName = useId();

  return (
    <div className="flex flex-col gap-4">
      {/* fieldset + legend: the screen reader announces "Choose your class, group". */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-xl">{texts.chooseClass}</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {classes.map((playerClass) => (
            <ClassCard
              key={playerClass.classId}
              playerClass={playerClass}
              groupName={groupName}
              checked={playerClass.classId === selectedClassId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="btn self-end btn-primary"
        disabled={selectedClassId === null}
        onClick={onNext}
      >
        {texts.next}
      </button>
    </div>
  );
}

interface NameStepProps {
  playerClass: ClassDto;
  onBack: () => void;
}

/** Step 2: name form. Success needs no navigate(): the page's <Navigate> reacts to the cache. */
function NameStep({ playerClass, onBack }: NameStepProps) {
  const createCharacter = useCreateCharacter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CharacterNameFormValues>({
    resolver: zodResolver(characterNameSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: CharacterNameFormValues) {
    try {
      await createCharacter.mutateAsync(toCreateCharacterRequest(values, playerClass.classId));
    } catch (error) {
      applyCharacterError(error, setError);
    }
  }

  const serverError = errors.root?.server;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
      <h2 className="text-xl">{texts.nameYourHero}</h2>

      <div className="flex flex-wrap items-center gap-3">
        <ClassBadge classId={playerClass.classId} name={playerClass.name} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
          {texts.changeClass}
        </button>
      </div>

      {/* Only render with an error: [message, false] would count as content for FormAlert. */}
      {serverError && (
        <FormAlert>
          {serverError.message}{' '}
          {serverError.type === ALREADY_HAS_CHARACTER && (
            <Link to="/" className="link font-semibold">
              {texts.goToHero}
            </Link>
          )}
        </FormAlert>
      )}

      <FormField
        label={texts.name}
        autoComplete="off"
        // The user just clicked "Next": continue typing without another click.
        autoFocus
        maxLength={CHARACTER_RULES.nameMax}
        error={errors.name?.message}
        {...register('name')}
      />

      <SubmitButton label={texts.submit} pendingLabel={texts.submitting} isPending={isSubmitting} />
    </form>
  );
}
