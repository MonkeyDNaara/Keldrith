import { z } from 'zod';
import type { CreateCharacterRequest } from '../api/types';
import { t } from '../i18n';

/** Same limits as the server (agreed contract). Change them here, the messages follow. */
export const CHARACTER_RULES = {
  nameMin: 2,
  nameMax: 20,
} as const;

const nameLength = t.validation.characterNameLength(
  CHARACTER_RULES.nameMin,
  CHARACTER_RULES.nameMax,
);

/** One schema for the wizard and the rename form: both only edit the name. */
export const characterNameSchema = z.object({
  // Trimmed first: "  Aldric " counts as 6 characters and is sent without the spaces.
  name: z
    .string()
    .trim()
    .min(CHARACTER_RULES.nameMin, nameLength)
    .max(CHARACTER_RULES.nameMax, nameLength),
});

export type CharacterNameFormValues = z.infer<typeof characterNameSchema>;

/** Form + picked class → API. The class comes from the wizard's first step, not from a field. */
export function toCreateCharacterRequest(
  { name }: CharacterNameFormValues,
  classId: string,
): CreateCharacterRequest {
  return { name, classId };
}
