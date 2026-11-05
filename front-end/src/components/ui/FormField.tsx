import { useId, type ComponentProps, type ReactNode } from 'react';

interface FormFieldProps extends Omit<ComponentProps<'input'>, 'id' | 'className'> {
  label: string;
  /** Message under the field; also marks the input as invalid for screen readers. */
  error?: string;
  /** Optional element inside the input box on the right, e.g. a show / hide button. */
  endAdornment?: ReactNode;
}

/**
 * Label + input + error message, accessible by default.
 * All other props go to the <input>, so `{...register('email')}` from react-hook-form
 * can be spread in directly (in React 19 `ref` is a normal prop, no forwardRef needed).
 */
export function FormField({ label, error, endAdornment, ...inputProps }: FormFieldProps) {
  // Unique per field, also with two forms on one page: links label and error to the input.
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {/* daisyUI: the "input" box wraps the real <input>, so the button sits inside it. */}
      <div className={`input w-full ${error ? 'input-error' : ''}`}>
        <input
          id={id}
          className="min-w-0 grow"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {endAdornment}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
