import type { LoginRequest } from '../api/types';

/**
 * Demo login for development and the presentation. Not a secret: the same account is
 * seeded by the mock API and (in development) by the back-end, so the button works with both.
 */
export const DEMO_ACCOUNT = {
  email: 'demo@keldrith.dev',
  password: 'demo-password',
} as const satisfies LoginRequest;

/** The "Use demo account" button only exists in `npm run dev`, never in a production build. */
export const SHOW_DEMO_LOGIN = import.meta.env.DEV;
