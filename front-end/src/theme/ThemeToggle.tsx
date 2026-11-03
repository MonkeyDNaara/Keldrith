import { Moon, Sun } from 'lucide-react';
import { t } from '../i18n';
import { useTheme } from './useTheme';

/** Icon button: shows the sun in dark mode and the moon in light mode (= the theme you switch to). */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? t.theme.switchToLight : t.theme.switchToDark;

  return (
    <button
      type="button"
      className="btn btn-circle btn-ghost text-accent"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
