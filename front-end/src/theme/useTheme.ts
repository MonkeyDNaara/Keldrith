import { useCallback, useEffect, useState } from 'react';

export type Theme = 'keldrith-dark' | 'keldrith-light';

// Keep the key and theme names in sync with the inline script in index.html.
const STORAGE_KEY = 'keldrith-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
  return value === 'keldrith-dark' || value === 'keldrith-light';
}

function readSavedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'keldrith-dark' : 'keldrith-light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not saved (e.g. privacy mode), but still applied for this visit.
  }
}

/**
 * Current theme + toggle.
 * First visit follows the OS; after a toggle the user's choice is saved and wins.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readSavedTheme() ?? getSystemTheme());

  // Follow OS changes live as long as the user has not picked a theme yet.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const handleChange = () => {
      if (!readSavedTheme()) {
        setTheme(getSystemTheme());
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'keldrith-dark' ? 'keldrith-light' : 'keldrith-dark';
    applyTheme(next);
    setTheme(next);
  }, [theme]);

  return { theme, isDark: theme === 'keldrith-dark', toggleTheme };
}
