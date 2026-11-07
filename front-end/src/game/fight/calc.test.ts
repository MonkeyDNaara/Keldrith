import { describe, expect, it } from 'vitest';
import type { SkillBase } from '../../api/types';
import { calculateDamage, calculateHeal, canUseSkill, rollVariance } from './calc';
import { fixedRng } from './testUtils';

describe('rollVariance', () => {
  it('goes from 0.9 (lowest roll) over 1 (middle) to just below 1.1 (highest roll)', () => {
    expect(rollVariance(fixedRng(0))).toBeCloseTo(0.9);
    expect(rollVariance(fixedRng(0.5))).toBeCloseTo(1);
    expect(rollVariance(fixedRng(0.999))).toBeLessThan(1.1);
  });
});

describe('calculateDamage', () => {
  // attack 14 + power 8 - defense 5 = 17
  const input = { attack: 14, power: 8, defense: 5, targetDefending: false };

  it('uses the plain value on a middle roll', () => {
    expect(calculateDamage(input, fixedRng(0.5))).toBe(17);
  });

  it('is up to 10 % lower on the lowest roll and 10 % higher on the highest', () => {
    expect(calculateDamage(input, fixedRng(0))).toBe(15); // 17 * 0.9 = 15.3
    expect(calculateDamage(input, fixedRng(0.99))).toBe(19); // 17 * 1.098 = 18.7
  });

  it('is never below 1, even if defense is higher than attack', () => {
    const weak = { attack: 5, power: 0, defense: 20, targetDefending: false };
    expect(calculateDamage(weak, fixedRng(0.5))).toBe(1);
  });

  it('is halved when the target defends', () => {
    const hit = { attack: 16, power: 0, defense: 6, targetDefending: false };
    expect(calculateDamage(hit, fixedRng(0.5))).toBe(10);
    expect(calculateDamage({ ...hit, targetDefending: true }, fixedRng(0.5))).toBe(5);
  });

  it('is still at least 1 when the target defends', () => {
    const tiny = { attack: 7, power: 0, defense: 6, targetDefending: true };
    expect(calculateDamage(tiny, fixedRng(0.5))).toBe(1);
  });
});

describe('calculateHeal', () => {
  it('restores the skill power on a middle roll', () => {
    expect(calculateHeal(20, 50, 100, fixedRng(0.5))).toBe(20);
  });

  it('varies with the roll', () => {
    expect(calculateHeal(20, 50, 100, fixedRng(0))).toBe(18);
  });

  it('never heals above max HP and reports only the HP really restored', () => {
    expect(calculateHeal(20, 95, 100, fixedRng(0.5))).toBe(5);
    expect(calculateHeal(20, 100, 100, fixedRng(0.5))).toBe(0);
  });
});

describe('canUseSkill', () => {
  const skill: SkillBase = {
    skillId: 'shield-bash',
    name: 'Shield Bash',
    description: '',
    type: 'Damage',
    power: 8,
    manaCost: 10,
  };

  it('needs at least the mana cost', () => {
    expect(canUseSkill(10, skill)).toBe(true);
    expect(canUseSkill(9, skill)).toBe(false);
  });
});
