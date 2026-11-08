import { Check } from 'lucide-react';
import type { PlayerCharacterDto } from '../../api/types';
import { learnSkillErrorMessage } from '../../character/learnSkillError';
import { getSkillState } from '../../game/skillState';
import { useClassSkills } from '../../hooks/useClassSkills';
import { useLearnSkill } from '../../hooks/useLearnSkill';
import { t } from '../../i18n';
import { FormAlert } from '../ui/FormAlert';
import { PageSpinner } from '../ui/PageSpinner';
import { SkillCard } from './SkillCard';

const texts = t.pages.skills;

interface SkillsPanelProps {
  character: PlayerCharacterDto;
}

/**
 * All skills of the hero's class, each as a card, and the "Learn" action.
 * Owns the data (class skills + the learn mutation); the page above only checks that the hero
 * exists. Same split as FightPage → FightArena: here the hero is never null, so the hooks
 * can get a real id.
 */
export function SkillsPanel({ character }: SkillsPanelProps) {
  const skills = useClassSkills(character.classId);
  const learn = useLearnSkill(character.characterId);

  if (skills.isPending) {
    return <PageSpinner />;
  }

  if (skills.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-danger">{texts.loadError}</p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => skills.refetch()}>
          {texts.retry}
        </button>
      </div>
    );
  }

  const learnedName = learn.isSuccess
    ? skills.data.find((skill) => skill.skillId === learn.variables.skillId)?.name
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <FormAlert>{learn.isError ? learnSkillErrorMessage(learn.error) : null}</FormAlert>

      {/* The live region stays in the page and only its content changes: that is what makes
          a screen reader announce "You learned …". */}
      <div role="status">
        {learnedName && (
          <div className="alert alert-soft text-sm alert-success">
            <Check className="size-4" aria-hidden="true" />
            {texts.justLearned(learnedName)}
          </div>
        )}
      </div>

      {skills.data.length === 0 ? (
        <p className="text-muted">{texts.empty}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
          {skills.data.map((skill) => (
            <li key={skill.skillId} className="min-w-0">
              <SkillCard
                skill={skill}
                state={getSkillState(skill, character)}
                isLearning={learn.isPending && learn.variables.skillId === skill.skillId}
                isBusy={learn.isPending}
                onLearn={(skillId) => learn.mutate({ skillId })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
