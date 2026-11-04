import { LogOut, Menu } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../../auth/authContext';
import { useMyCharacter } from '../../hooks/useMyCharacter';
import { t } from '../../i18n';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { ClassBadge } from '../ui/ClassBadge';
import { StatBar } from '../ui/StatBar';

interface NavItem {
  to: string;
  label: string;
  /** Only active on exactly this path (not on its sub-paths). */
  end?: boolean;
}

/** Navigation depends on the data: with a character → its pages, without → create one. */
function getNavItems(characterId: number | undefined): NavItem[] {
  if (characterId === undefined) {
    return [{ to: '/characters/new', label: t.nav.createCharacter }];
  }
  const base = `/characters/${characterId}`;
  return [
    { to: base, label: t.nav.character, end: true },
    { to: `${base}/fight`, label: t.nav.fight },
    { to: `${base}/skills`, label: t.nav.skills },
  ];
}

/** The dropdown stays open while it has focus; blurring closes it after a click. */
function closeDropdown() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function TopBar() {
  const { logout } = useAuth();
  const { data: character, isPending } = useMyCharacter();
  const navItems = getNavItems(character?.characterId);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-base-200/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 sm:gap-6 sm:px-8">
        <Link
          to="/"
          className="font-display text-xl font-black tracking-wide text-accent sm:text-2xl"
        >
          {t.app.name}
        </Link>

        <nav aria-label={t.nav.main} className="hidden gap-1 sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `btn btn-ghost btn-sm ${isActive ? 'text-accent' : 'text-base-content'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
          {isPending ? (
            <span className="h-4 w-24 skeleton sm:w-40" aria-label={t.common.loading} />
          ) : character ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden min-w-0 sm:inline-flex">
                <ClassBadge classId={character.classId} name={character.name} size="sm" />
              </span>
              <div className="w-24 sm:w-40">
                <StatBar
                  label={t.character.level(character.level)}
                  value={character.xp}
                  max={character.xpToNextLevel}
                  color="xp"
                  showValue={false}
                />
              </div>
            </div>
          ) : null}

          <ThemeToggle />

          <button
            type="button"
            className="btn hidden btn-ghost btn-sm sm:inline-flex"
            onClick={logout}
          >
            <LogOut className="size-4" />
            {t.auth.logout}
          </button>

          <div className="dropdown dropdown-end sm:hidden">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost"
              aria-label={t.nav.openMenu}
            >
              <Menu className="size-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-20 mt-2 w-56 rounded-box border border-line bg-base-200 p-2 shadow-lg"
            >
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={closeDropdown}
                    className={({ isActive }) => (isActive ? 'menu-active' : '')}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <button type="button" onClick={logout}>
                  <LogOut className="size-4" />
                  {t.auth.logout}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
