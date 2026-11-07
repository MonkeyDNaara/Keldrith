import { describe, expect, it } from 'vitest';
import { SEED_MONSTERS } from '../../api/mock/seed';
import type { SkillBase } from '../../api/types';
import { createCombatant } from './combatants';
import { chooseMonsterAction } from './monsterAi';
import { sequenceRng } from './testUtils';
import type { Combatant } from './types';

const [goblin, wolf] = SEED_MONSTERS;

function monsterOf(dto: (typeof SEED_MONSTERS)[number], changes: Partial<Combatant> = {}) {
  return { ...createCombatant('monster', dto, dto.skills), ...changes };
}

const attack = { type: 'attack' };

describe('chooseMonsterAction', () => {
  it('attacks when the chance roll is 0.3 or higher', () => {
    expect(chooseMonsterAction(monsterOf(goblin), sequenceRng([0.3]))).toEqual(attack);
    expect(chooseMonsterAction(monsterOf(goblin), sequenceRng([0.9]))).toEqual(attack);
  });

  it('uses a skill when the chance roll is below 0.3', () => {
    const choice = chooseMonsterAction(monsterOf(goblin), sequenceRng([0.29, 0]));
    expect(choice).toEqual({ type: 'skill', skillId: 'dirty-stab' });
  });

  it('picks the skill with the second roll (wolf: bite or howl)', () => {
    expect(chooseMonsterAction(monsterOf(wolf), sequenceRng([0.1, 0]))).toEqual({
      type: 'skill',
      skillId: 'bite',
    });
    expect(chooseMonsterAction(monsterOf(wolf), sequenceRng([0.1, 0.99]))).toEqual({
      type: 'skill',
      skillId: 'howl',
    });
  });

  it('only picks skills it can pay for', () => {
    // 7 mana: bite costs 5, howl costs 10 → only bite is possible.
    const weakWolf = monsterOf(wolf, { mana: 7 });
    expect(chooseMonsterAction(weakWolf, sequenceRng([0.1, 0.99]))).toEqual({
      type: 'skill',
      skillId: 'bite',
    });
  });

  it('attacks without a second roll when it cannot pay any skill', () => {
    const noMana = monsterOf(wolf, { mana: 4 });
    // Only one value planned: a second roll would make the test fail.
    expect(chooseMonsterAction(noMana, sequenceRng([0.0]))).toEqual(attack);
  });

  it('attacks when it has no skills at all', () => {
    const plain = monsterOf(goblin, { skills: [] });
    expect(chooseMonsterAction(plain, sequenceRng([0.0]))).toEqual(attack);
  });

  describe('heal skills', () => {
    const heal: SkillBase = {
      skillId: 'mend-self',
      name: 'Mend Self',
      description: '',
      type: 'Heal',
      power: 10,
      manaCost: 5,
    };

    it('does not waste a heal at full HP', () => {
      const healthy = monsterOf(goblin, { skills: [heal] });
      expect(chooseMonsterAction(healthy, sequenceRng([0.1]))).toEqual(attack);
    });

    it('uses a heal when hurt', () => {
      const hurt = monsterOf(goblin, { skills: [heal], hp: 10 });
      expect(chooseMonsterAction(hurt, sequenceRng([0.1, 0]))).toEqual({
        type: 'skill',
        skillId: 'mend-self',
      });
    });
  });
});
