import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { t } from '../../i18n';
import { FormField } from './FormField';

/** Same props as FormField; type and the right-hand slot are set here. */
type PasswordFieldProps = Omit<ComponentProps<typeof FormField>, 'type' | 'endAdornment'>;

/** FormField for passwords with a show / hide toggle inside the input box. */
export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <FormField
      {...props}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <button
          // type="button": a plain <button> inside a <form> would submit the form.
          type="button"
          className="btn -mr-2 btn-square btn-ghost btn-sm"
          // Toggle button: the label stays, aria-pressed says whether it is on.
          aria-label={t.form.showPassword}
          aria-pressed={isVisible}
          title={isVisible ? t.form.hidePassword : t.form.showPassword}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      }
    />
  );
}
