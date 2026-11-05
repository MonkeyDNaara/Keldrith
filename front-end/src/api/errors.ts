import type { ProblemDetails } from './types';

/** Status used when no response arrived at all (network down, back-end not running). */
export const NETWORK_ERROR_STATUS = 0;

/**
 * The one error type of the API layer. The HTTP client and the mocks both throw it,
 * so components handle errors the same way, whatever is behind the API.
 */
export class ApiError extends Error {
  /** HTTP status, or NETWORK_ERROR_STATUS (0) if there was no response. */
  readonly status: number;
  /** Validation messages per field (400), keys in camelCase: `fieldErrors.email`. */
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, problem: ProblemDetails = {}) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = normalizeFieldErrors(problem.errors);
  }

  /** 4xx: the request itself was wrong; sending it again gives the same answer. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** First message for a form field, or undefined. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/** Type guard: inside `if (isApiError(error))` TypeScript knows `error.status` exists. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * ASP.NET may name fields "Email" (C# property) or "$.email" (JSON path) instead of "email".
 * Normalize once here, so forms can always look up the camelCase name.
 */
function normalizeFieldErrors(errors: ProblemDetails['errors']): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, messages] of Object.entries(errors ?? {})) {
    const name = key.replace(/^\$\./, '');
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    result[camel] = [...(result[camel] ?? []), ...messages];
  }
  return result;
}
