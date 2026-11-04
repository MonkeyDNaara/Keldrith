import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { isApiError, NETWORK_ERROR_STATUS, type ApiError } from '../api/errors';
import { t } from '../i18n';

/** Form-wide message (shown above the form): own texts, never the raw server message. */
function formMessage(error: ApiError): string {
  switch (error.status) {
    case 401:
      return t.authErrors.invalidCredentials;
    case 409:
      return t.authErrors.usernameOrEmailTaken;
    case NETWORK_ERROR_STATUS:
      return t.authErrors.network;
    default:
      return t.authErrors.unexpected;
  }
}

/** Message for one field. 409 gets an own text; 400 keeps the server text as fallback. */
function fieldMessage(error: ApiError, field: string, serverMessage: string): string {
  if (error.status === 409 && field === 'username') {
    return t.authErrors.usernameTaken;
  }
  if (error.status === 409 && field === 'email') {
    return t.authErrors.emailTaken;
  }
  return serverMessage;
}

/**
 * Shows a failed login / register in the form (react-hook-form).
 * Field errors from the server (400, or 409 with `errors`) go to their fields;
 * everything else becomes one form-wide message in `errors.root.server`.
 */
export function applyAuthError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): void {
  if (!isApiError(error)) {
    setError('root.server', { type: 'server', message: t.authErrors.unexpected });
    return;
  }

  let hasFieldError = false;
  for (const field of fields) {
    const serverMessage = error.fieldError(field);
    if (serverMessage) {
      setError(field, { type: 'server', message: fieldMessage(error, field, serverMessage) });
      hasFieldError = true;
    }
  }

  if (!hasFieldError) {
    setError('root.server', { type: 'server', message: formMessage(error) });
  }
}
