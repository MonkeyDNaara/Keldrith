import type { UseFormSetError } from 'react-hook-form';
import { isApiError, NETWORK_ERROR_STATUS, type ApiError } from '../api/errors';
import { t } from '../i18n';
import type { CharacterNameFormValues } from './characterSchemas';

/**
 * `errors.root.server.type` for a 409: the wizard checks it to add a link to the existing hero
 * (a message is only a string, a link needs JSX).
 */
export const ALREADY_HAS_CHARACTER = 'alreadyHasCharacter';

function formMessage(error: ApiError): string {
  switch (error.status) {
    case 404:
      return t.characterErrors.notFound;
    case 409:
      return t.characterErrors.alreadyHasCharacter;
    case NETWORK_ERROR_STATUS:
      return t.characterErrors.network;
    default:
      return t.characterErrors.unexpected;
  }
}

/** Message for a failed character request outside a form (e.g. the delete dialog). */
export function characterErrorMessage(error: unknown): string {
  return isApiError(error) ? formMessage(error) : t.characterErrors.unexpected;
}

/**
 * Shows a failed create / rename in the name form (react-hook-form).
 * 400 on `name` → under the field · 400 on `classId` → form-wide (no class field in this step)
 * · everything else → one form-wide message with an own text.
 */
export function applyCharacterError(
  error: unknown,
  setError: UseFormSetError<CharacterNameFormValues>,
): void {
  if (!isApiError(error)) {
    setError('root.server', { type: 'server', message: t.characterErrors.unexpected });
    return;
  }

  const nameMessage = error.fieldError('name');
  if (nameMessage) {
    setError('name', { type: 'server', message: nameMessage });
    return;
  }

  if (error.fieldError('classId')) {
    setError('root.server', { type: 'server', message: t.characterErrors.invalidClass });
    return;
  }

  setError('root.server', {
    type: error.status === 409 ? ALREADY_HAS_CHARACTER : 'server',
    message: formMessage(error),
  });
}
