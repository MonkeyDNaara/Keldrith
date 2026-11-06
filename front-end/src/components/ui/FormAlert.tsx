import type { ReactNode } from 'react';

interface FormAlertProps {
  /** Nothing to show → renders nothing, so callers can pass `errors.root?.server?.message`. */
  children?: ReactNode;
}

/**
 * Form-wide error above a form (e.g. "server cannot be reached").
 * role="alert" makes screen readers announce it as soon as it appears.
 */
export function FormAlert({ children }: FormAlertProps) {
  if (!children) {
    return null;
  }

  return (
    <div role="alert" className="alert alert-soft text-sm alert-error">
      {children}
    </div>
  );
}
