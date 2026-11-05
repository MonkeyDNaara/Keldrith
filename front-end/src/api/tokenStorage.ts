/**
 * Keeps the JWT between page reloads (localStorage, key below).
 * Accepted MVP trade-off: readable by JavaScript (XSS risk); see the README.
 * Every access is wrapped in try/catch: storage can be blocked (private mode, browser settings).
 */
const STORAGE_KEY = 'keldrith-token';

interface StoredToken {
  token: string;
  /** ISO 8601 UTC, from AuthResponse.expiresAt */
  expiresAt: string;
}

/** The saved token, or null if there is none or it has expired (an expired one is removed). */
export function getToken(): string | null {
  const stored = readStoredToken();
  if (!stored) {
    return null;
  }
  if (Date.parse(stored.expiresAt) <= Date.now()) {
    clearToken();
    return null;
  }
  return stored.token;
}

export function saveToken(token: string, expiresAt: string): void {
  const stored: StoredToken = { token, expiresAt };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked: the login only lasts until the next reload.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing saved, nothing to remove.
  }
}

function readStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isStoredToken(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Data from storage is untrusted (old format, edited by hand): check its shape. */
function isStoredToken(value: unknown): value is StoredToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StoredToken).token === 'string' &&
    typeof (value as StoredToken).expiresAt === 'string'
  );
}
