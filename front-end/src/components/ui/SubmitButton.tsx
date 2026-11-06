import type { ComponentProps } from 'react';

interface SubmitButtonProps extends Omit<ComponentProps<'button'>, 'type' | 'children'> {
  /** Text while idle, e.g. "Log in". */
  label: string;
  /** Text while the request runs, e.g. "Logging in…". */
  pendingLabel: string;
  /** From react-hook-form (`isSubmitting`) or a mutation (`isPending`). */
  isPending: boolean;
}

/**
 * Submit button with a spinner. Disabled while pending, so a double click sends only one request.
 * All other <button> props pass through (e.g. className="btn-sm" for a smaller form).
 */
export function SubmitButton({
  label,
  pendingLabel,
  isPending,
  disabled,
  className = '',
  ...buttonProps
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={`btn btn-primary ${className}`}
      disabled={isPending || disabled}
      {...buttonProps}
    >
      {isPending && <span className="loading loading-sm loading-spinner" aria-hidden="true" />}
      {isPending ? pendingLabel : label}
    </button>
  );
}
