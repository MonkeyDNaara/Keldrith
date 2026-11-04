import type { KeldrithApi } from './api';
import { httpApi } from './httpApi';
import { mockApi } from './mock/mockApi';

/** Set in .env.development (or .env.local). Only the exact string "true" turns mocks on. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * The API the whole app uses. Components and hooks import only this,
 * never httpApi or mockApi directly: switching is this one decision.
 */
export const api: KeldrithApi = USE_MOCKS ? mockApi : httpApi;

export { ApiError, isApiError } from './errors';
