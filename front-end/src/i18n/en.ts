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
    checkingSession: 'Checking your session…',
  },
  form: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  validation: {
    usernameLength: (min: number, max: number) => `Username must be ${min}–${max} characters.`,
    emailInvalid: 'Please enter a valid email address.',
    passwordMin: (min: number) => `Password must be at least ${min} characters.`,
    passwordRequired: 'Please enter your password.',
    passwordsMismatch: 'Passwords do not match.',
  },
  /** Own texts for server errors: server messages may be technical or in another language. */
  authErrors: {
    invalidCredentials: 'Email or password is wrong.',
    usernameOrEmailTaken: 'This username or email is already taken.',
    usernameTaken: 'This username is already taken.',
    emailTaken: 'This email is already registered.',
    network: 'The server cannot be reached. Please try again later.',
    unexpected: 'Something went wrong. Please try again.',
  },
  pages: {
    comingSoon: 'This page is coming soon.',
    login: {
      title: 'Log in',
      email: 'Email',
      password: 'Password',
      submit: 'Log in',
      submitting: 'Logging in…',
      demoDivider: 'or',
      demoSubmit: 'Use demo account',
      demoHint: 'Development only: logs in to the seeded demo account.',
      noAccount: 'No account yet?',
      toRegister: 'Register',
    },
    register: {
      title: 'Create account',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Create account',
      submitting: 'Creating account…',
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
