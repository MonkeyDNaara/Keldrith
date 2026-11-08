import type { PlayerCharacterDto, PlayerSkillDto } from '../api/types';

/**
 * What the skills page shows for one skill. A discriminated union: `kind` tells TypeScript
 * which other fields exist (only a locked skill has a `reason`).
 */
export type SkillState =
  { kind: 'learned' } | { kind: 'learnable' } | { kind: 'locked'; reason: 'level' | 'points' };

/** Only the fields the rules need: easy to call, easy to test. */
type SkillHolder = Pick<PlayerCharacterDto, 'level' | 'skillPoints' | 'learnedSkills'>;

/**
 * A hint for the UI, never the source of truth: the server checks every rule again when the
 * player clicks "Learn". The order mirrors the server (learned → level → points), so the
 * reason shown here is the one the server would name first.
 */
export function getSkillState(skill: PlayerSkillDto, character: SkillHolder): SkillState {
  if (character.learnedSkills.some((learned) => learned.skillId === skill.skillId)) {
    return { kind: 'learned' };
  }
  if (character.level < skill.requiredLevel) {
    return { kind: 'locked', reason: 'level' };
  }
  if (character.skillPoints < skill.skillPointCost) {
    return { kind: 'locked', reason: 'points' };
  }
  return { kind: 'learnable' };
}
