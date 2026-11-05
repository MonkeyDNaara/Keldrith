import { z } from 'zod';
import type { RegisterRequest } from '../api/types';
import { t } from '../i18n';

/** Same limits as the server (agreed contract). Change them here, the messages follow. */
export const AUTH_RULES = {
  usernameMin: 3,
  usernameMax: 20,
  passwordMin: 8,
} as const;

/** Trimmed first, so "  niko@example.com " is valid and sent without the spaces. */
const emailField = z.string().trim().pipe(z.email(t.validation.emailInvalid));

export const loginSchema = z.object({
  email: emailField,
  // Login only checks "not empty": the length rule is the register form's job.
  password: z.string().min(1, t.validation.passwordRequired),
});

const usernameLength = t.validation.usernameLength(AUTH_RULES.usernameMin, AUTH_RULES.usernameMax);

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(AUTH_RULES.usernameMin, usernameLength)
      .max(AUTH_RULES.usernameMax, usernameLength),
    email: emailField,
    // Not trimmed: spaces are allowed in passwords.
    password: z
      .string()
      .min(AUTH_RULES.passwordMin, t.validation.passwordMin(AUTH_RULES.passwordMin)),
    confirmPassword: z.string(),
  })
  // Rule across two fields: runs after the field rules, the error shows at confirmPassword.
  .refine((values) => values.password === values.confirmPassword, {
    error: t.validation.passwordsMismatch,
    path: ['confirmPassword'],
  });

/** Form value types come from the schemas: one source for rules and types. */
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Form → API: confirmPassword stays in the browser. The return type guards the DTO shape. */
export function toRegisterRequest({
  username,
  email,
  password,
}: RegisterFormValues): RegisterRequest {
  return { username, email, password };
}
