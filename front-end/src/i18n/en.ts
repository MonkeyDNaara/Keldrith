/**
 * All English UI texts in one place.
 * Static texts are strings; texts with values are functions (typed parameters).
 * A second language later = a second object with the same shape (`Messages`).
 */
export const en = {
  app: {
    name: 'Keldrith',
  },
  common: {
    loading: 'Loading…',
  },
  nav: {
    main: 'Main navigation',
    openMenu: 'Open menu',
    character: 'Character',
    fight: 'Fight',
    skills: 'Skills',
    createCharacter: 'Create character',
  },
  auth: {
    logout: 'Log out',
  },
  pages: {
    comingSoon: 'This page is coming soon.',
    login: {
      title: 'Log in',
      mockHint: 'Logs in to the demo account (mock API, no back-end needed).',
      mockSubmit: 'Log in (mock)',
      noAccount: 'No account yet?',
      toRegister: 'Register',
    },
    register: {
      title: 'Create account',
      hasAccount: 'Already have an account?',
      toLogin: 'Log in',
    },
    home: {
      loadError: 'Your character could not be loaded.',
      retry: 'Try again',
    },
    createCharacter: { title: 'Create your hero' },
    characterDetail: { title: 'Your hero' },
    fight: { title: 'Fight' },
    skills: { title: 'Skills' },
    notFound: {
      title: 'Page not found',
      text: 'This path leads nowhere.',
      backHome: 'Back to the start',
    },
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
