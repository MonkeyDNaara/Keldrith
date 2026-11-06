import { Link } from 'react-router';
import type { PlayerSkillDto, SkillType } from '../../api/types';
import { t } from '../../i18n';

interface LearnedSkillsListProps {
  characterId: number;
  skills: PlayerSkillDto[];
}

// SkillType is a closed union: Record (not Partial) makes TypeScript demand a color for every type.
const TYPE_BADGE: Record<SkillType, string> = {
  Damage: 'badge-error',
  Heal: 'badge-success',
  Buff: 'badge-info',
};

/** The character's learned skills (later = its fight actions). Empty → hint + link to learn. */
export function LearnedSkillsList({ characterId, skills }: LearnedSkillsListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg">{t.character.learnedSkills}</h2>

      {skills.length === 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-box border border-dashed border-line p-4">
          <p className="text-sm text-muted">{t.character.noSkills}</p>
          <Link to={`/characters/${characterId}/skills`} className="link text-sm text-accent">
            {t.character.learnSkills}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
          {skills.map((skill) => (
            <li
              key={skill.skillId}
              className="flex min-w-0 flex-col gap-2 rounded-box border border-line bg-base-200 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="truncate font-semibold">{skill.name}</span>
                <span className={`badge shrink-0 badge-soft badge-sm ${TYPE_BADGE[skill.type]}`}>
                  {t.skillTypes[skill.type]}
                </span>
              </div>
              <p className="text-sm text-muted">{skill.description}</p>
              <p className="mt-auto flex gap-4 text-xs text-faint tabular-nums">
                <span>
                  {t.character.power} {skill.power}
                </span>
                <span>
                  {t.character.manaCost} {skill.manaCost}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
