import { ApiError, NETWORK_ERROR_STATUS } from './errors';
import { getToken } from './tokenStorage';
import type { ProblemDetails } from './types';

/** Relative: in development the Vite proxy forwards /api to the back-end (no CORS). */
const API_BASE = '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  /** Lets TanStack Query cancel a request that is no longer needed. */
  signal?: AbortSignal;
}

// ---- 401 handling ----

let unauthorizedHandler: (() => void) | null = null;

/**
 * Called when the server rejects our token (401 on a request that sent one).
 * The AuthProvider registers its logout here, so the client does not need to know React.
 */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

// ---- Core ----

/**
 * Sends one request to the API and returns the parsed JSON body.
 * Throws ApiError for every failure: HTTP error status, no response, invalid JSON.
 * `T` is trusted, not checked: the shape comes from the agreed contract (types.ts).
 */
export async function request<T>(
  method: HttpMethod,
  path: string,
  { body, signal }: RequestOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // A cancelled request is not an error: let the caller (TanStack Query) see the abort.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(NETWORK_ERROR_STATUS, {
      title: 'Network error',
      detail: 'The server could not be reached.',
    });
  }

  if (!response.ok) {
    // 401 with a token = token expired or invalid → log out. Without a token (e.g. wrong
    // password on login) it is just a failed request, the form shows the error.
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status, await readProblemDetails(response));
  }

  // 204 No Content (DELETE) or an empty body: nothing to parse.
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, { title: 'Invalid response', detail: 'Body is not JSON.' });
  }
}

/** Reads the ProblemDetails body; falls back to the status text if the body is not JSON. */
async function readProblemDetails(response: Response): Promise<ProblemDetails> {
  try {
    const problem: unknown = await response.json();
    if (typeof problem === 'object' && problem !== null) {
      return problem as ProblemDetails;
    }
  } catch {
    // No JSON body (e.g. a proxy error page).
  }
  return { status: response.status, title: response.statusText };
}

// ---- Shortcuts, one per HTTP method ----

export const client = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, { body }),
  delete: (path: string) => request<void>('DELETE', path),
};
