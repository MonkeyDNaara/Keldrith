import { MoonIcon } from '../components/icons/MoonIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { useTheme } from './useTheme';

/** Icon button: shows the sun in dark mode and the moon in light mode (= the theme you switch to). */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  // TODO(#6): move the labels to src/i18n/en.ts
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="btn btn-circle btn-ghost text-accent"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
