/**
 * All English UI texts in one place.
 * Static texts are strings; texts with values are functions (typed parameters).
 * A second language later = a second object with the same shape (`Messages`).
 */
export const en = {
  app: {
    name: 'Keldrith',
  },
  theme: {
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
  },
  character: {
    level: (level: number) => `Level ${level}`,
    xp: 'XP',
  },
  stats: {
    maxHp: 'HP',
    maxMana: 'Mana',
    attack: 'Attack',
    defense: 'Defense',
    speed: 'Speed',
  },
} as const;

export type Messages = typeof en;
