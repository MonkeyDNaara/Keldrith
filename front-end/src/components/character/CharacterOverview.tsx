import { Link } from 'react-router';
import type { PlayerCharacterDto } from '../../api/types';
import { classColorStyle } from '../../game/classVisuals';
import { t } from '../../i18n';
import { ClassBadge } from '../ui/ClassBadge';
import { StatBar } from '../ui/StatBar';
import { StatList } from '../ui/StatList';

interface CharacterOverviewProps {
  character: PlayerCharacterDto;
  /** Display name of the class (ClassDto.name); without it ClassBadge shows the id. */
  classDisplayName?: string;
}

/**
 * Class, level, XP and skill points, then the stats. Only shows server values:
 * level, xpToNextLevel and stats are computed by the server, never here.
 */
export function CharacterOverview({ character, classDisplayName }: CharacterOverviewProps) {
  const { characterId, classId, level, xp, xpToNextLevel, skillPoints, stats } = character;

  return (
    <div
      style={classColorStyle(classId)}
      className="flex flex-col gap-5 rounded-box border border-t-4 border-line border-t-class bg-base-200 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ClassBadge classId={classId} name={classDisplayName} />
        <span className="badge badge-outline">{t.character.level(level)}</span>
      </div>

      <StatBar label={t.character.xp} value={xp} max={xpToNextLevel} color="xp" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          <span className="text-muted">{t.character.skillPoints}: </span>
          <span className="font-semibold tabular-nums">{skillPoints}</span>
        </p>
        {/* Only worth a call to action when there is something to spend. */}
        {skillPoints > 0 && (
          <Link to={`/characters/${characterId}/skills`} className="btn btn-outline btn-sm">
            {t.character.learnSkills}
          </Link>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg">{t.character.stats}</h2>
        <StatList stats={stats} />
      </section>
    </div>
  );
}
