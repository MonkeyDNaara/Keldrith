import { isApiError } from '../api/errors';
import { t } from '../i18n';
import { characterErrorMessage } from './applyCharacterError';

/**
 * Message for a failed "learn skill" request. 400 and 409 mean the page was out of date
 * (the server checked a rule the screen did not know about), so they get their own wording;
 * 404, network and unexpected errors reuse the character texts.
 */
export function learnSkillErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 400) {
      return t.skillErrors.cannotLearn;
    }
    if (error.status === 409) {
      return t.skillErrors.alreadyLearned;
    }
  }
  return characterErrorMessage(error);
}
