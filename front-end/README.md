# Keldrith – Front-end

React + TypeScript single-page app for Keldrith, built with Vite.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` (the project uses Node 26, see `.nvmrc`)
- npm (comes with Node)

## Getting started

```bash
cd front-end
nvm use        # optional, switches to the Node version from .nvmrc
npm install
npm run dev    # http://localhost:5173
```

## Scripts

| Script                 | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload                 |
| `npm run build`        | Type-check and build for production into `dist/`     |
| `npm run preview`      | Serve the production build locally                   |
| `npm run lint`         | Lint all files with ESLint                           |
| `npm run format`       | Format all files with Prettier                       |
| `npm run format:check` | Check formatting without changing files              |
| `npm run typecheck`    | Type-check only                                      |
| `npm run test`         | Run the unit tests once (Vitest)                     |
| `npm run test:watch`   | Run the tests again on every change                  |
| `npm run check`        | Lint + format check + tests + build – before each PR |

## Routes

| Path                              | Page                                                                                        | Access    |
| --------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| `/`                               | Landing page; logged-in players are redirected: no character → create, else → the character | public    |
| `/login`, `/register`             | Login / register                                                                            | public    |
| `/characters/new`                 | Create character                                                                            | logged in |
| `/characters/:characterId`        | Character detail                                                                            | logged in |
| `/characters/:characterId/fight`  | Fight                                                                                       | logged in |
| `/characters/:characterId/skills` | Skills                                                                                      | logged in |
| `/styleguide`                     | Token and component preview                                                                 | dev only  |
| `*`                               | Not found                                                                                   | public    |

## Landing page

`pages/LandingPage.tsx` is the start page (`/`) for visitors: hero (name, tagline, "Play now" / "Log in"),
"How it works" cards and one tile per class. It uses its own `LandingLayout` (slim header + footer).
A logged-in player never sees it: `/` renders `HomeRedirect`, which sends them to their hero or to the
character wizard. Texts live in `i18n/en.ts` (`pages.landing`); the classes are static (icons and colors
from `game/classVisuals.ts`), so the page needs no API. The footer (`components/layout/Footer.tsx`) is part of
all three layouts.

## API & mocks

All server data goes through one typed API layer in `src/api/`. Components and hooks only use
`api` from `src/api` – they never call `fetch` and don't know whether mocks or the real back-end
answer.

```
components / hooks ──► api (KeldrithApi) ──┬─► httpApi ─► client.ts (fetch) ─► /api ─► back-end
                                           └─► mockApi ─► mock data in localStorage
```

| File              | Role                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `types.ts`        | DTOs, 1:1 with the API contract                                     |
| `api.ts`          | `KeldrithApi` interface – both implementations must fulfil it       |
| `client.ts`       | `fetch` wrapper: JSON, `Authorization: Bearer`, errors → `ApiError` |
| `errors.ts`       | `ApiError` (status, field errors from `ProblemDetails`)             |
| `tokenStorage.ts` | JWT in `localStorage` (key `keldrith-token`)                        |
| `httpApi.ts`      | real back-end                                                       |
| `mock/`           | mock API with the same seed data, rules and status codes            |
| `index.ts`        | picks mock or HTTP from `VITE_USE_MOCKS`                            |

**Switch** in `.env.development` (or override locally in `.env.local`, see `.env.example`):

| `VITE_USE_MOCKS` | API                                                                         |
| ---------------- | --------------------------------------------------------------------------- |
| `true`           | mock API in the browser, no back-end needed                                 |
| `false`          | real back-end; the Vite dev proxy forwards `/api` → `http://localhost:5080` |

**Mock data** survives reloads (`localStorage` key `keldrith-mock-db`). Demo login: see
[Auth](#auth). To reset, delete the key in the browser devtools
(Application → Local Storage).

**Security note (MVP):** the JWT is kept in `localStorage`, which JavaScript can read (XSS risk).
Accepted for the course project; an httpOnly cookie is the safer option later. Never put secrets
in `VITE_*` variables – they end up in the browser bundle.

## Auth

`AuthProvider` (`src/auth/`) owns the login state; components only use `useAuth()`
(`user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`). It talks only to `api`,
so nothing changes in the components when switching from mocks to the real back-end.

```
start ─► token saved? ─ no ─► logged out
              │ yes
              ▼
        GET /api/auth/me ─┬─ 200 ─► logged in
                          ├─ 401 ─► logout (token removed)
                          └─ no answer / 5xx ─► logged out for now, token kept

any request ─► 401 with a token ─► logout: token removed + query cache cleared
```

- **Forms:** react-hook-form + zod schemas in `auth/authSchemas.ts` (same rules as the server;
  types come from the schemas). Server errors are mapped in `auth/applyAuthError.ts`: field
  errors (400) go to their fields, 401 / 409 / network errors become own texts above the form.
- **Register** logs the new user in; `/` then leads to character creation.
- **Demo login:** the "Use demo account" button (`npm run dev` only, `auth/demoAccount.ts`)
  logs in to `demo@keldrith.dev` / `demo-password`. The mock API seeds this account; the
  back-end must seed the same one in development (never in production).

## Character

One character per user. All character data comes from the API through hooks
(`useMyCharacter`, `useClasses`, `useCharacterMutations`), so the pages never change when
switching from mocks to the real back-end.

```
/ ─► HomeRedirect ─┬─ no character ─► /characters/new  (wizard: class → name)
                   └─ character    ─► /characters/:id  (overview, skills, rename, delete)

create / rename ─► server answer replaces the cached character (top bar updates at once)
delete          ─► cache = null ─► detail page redirects to the wizard
```

- **Wizard** (`pages/CreateCharacterPage.tsx`): classes are loaded from `GET /api/classes`
  (unknown classes get fallback visuals); roles are info only. A radio group of class cards
  (keyboard: arrow keys), then the name form. A user who already has a character is sent to
  the detail page; a 409 shows its own message with a link to the existing hero.
- **Detail** (`pages/CharacterDetailPage.tsx`): level, XP bar, skill points, stats and learned
  skills — only values from the server, nothing is computed here. Rename inline (Esc cancels),
  delete in a native `<dialog>` with confirmation. An invalid or foreign id shows "not found".
- **Forms:** one zod schema for the name (`character/characterSchemas.ts`); server errors are
  mapped in `character/applyCharacterError.ts`.

## Fight engine

`src/game/fight/` is a pure TypeScript engine (no React, no browser APIs) that plays a 1-vs-1
fight as a reducer. The fight screen drives it with `useReducer`; the API only receives the
outcome. Import from `game/fight` (the `index.ts`) only.

```ts
const reducer = createFightReducer(Math.random); // create once; tests pass fixed numbers instead
let state = createFight(character, monster); // both at full HP and mana

state = reducer(state, { type: 'playerTurn', choice: { type: 'attack' } });
state = reducer(state, { type: 'monsterTurn' }); // when state.active === 'monster'
// state.status: 'Running' | 'Won' | 'Lost' | 'Fled' (same values as the fight result request)
// state.turn: number of actions of both sides (the `turns` of the request)
```

- **Turn order by speed:** every fighter has a point on a timeline (`nextActionAt`); the smallest
  value acts next and then moves back by `10000 / speed`. Speed 9 against 4 means about 2.25
  actions per action of the slower one. The order is derived, never stored, so a changed speed
  (`speedBonus`) is picked up from the next interval on. `previewTurnOrder` lists the next actors.
- **Actions** (both sides): attack, defend, skill (costs mana). The player can also flee.
- **Damage:** `max(1, attack + bonus + power - defense)` with ±10 % variance. A normal attack has
  power 0. Defending halves incoming damage until the fighter's next turn.
- **Skills:** `Damage` hits the opponent, `Heal` restores own HP (never above max HP), `Buff` raises
  own attack for the rest of the fight.
- **Monster AI:** with 30 % chance it uses a random skill it can pay for (no heal at full HP),
  otherwise it attacks.
- **Outcome:** `Won` / `Lost` at 0 HP, `Fled` when the player flees. After that every action is
  ignored.
- **Pure and testable:** the random number function is injected, the old state is never changed,
  and an action that is not allowed right now (wrong turn, not enough mana, fight over) returns the
  very same state. The log holds data events (`FightEvent`), not texts: the UI turns them into text.
- **Tests** live next to the code (`*.test.ts`); `npm run test` runs them. Balance numbers are in
  `game/fight/rules.ts`.

| File              | Content                                                        |
| ----------------- | -------------------------------------------------------------- |
| `types.ts`        | `Combatant`, `FightState`, `FightAction`, `FightEvent` …       |
| `rules.ts`        | balance numbers (variance, defend factor, AI chance, time)     |
| `calc.ts`         | damage, heal and mana calculations                             |
| `combatants.ts`   | creating a fighter, attack including buffs                     |
| `turnOrder.ts`    | speed-based timeline: next actor, preview                      |
| `monsterAi.ts`    | what a monster does on its turn                                |
| `fightReducer.ts` | `createFight`, `createFightReducer` (attack, defend, skills …) |

## Fight screen

`pages/FightPage.tsx` (`/characters/:characterId/fight`) connects the fight engine to the UI.
The flow: pick a monster (`useMonsters`, each card shows its `xpReward`), fight it in
`FightArena`, see the reward in a result dialog. "Fight again" goes back to the monster list.

- **The UI only displays and forwards.** Buttons dispatch actions to the engine, the engine
  decides everything. XP, level-ups and skill points are never computed in the front-end: the
  server decides them from `{ npcId, outcome, turns }`.
- **Monster turns:** `hooks/useMonsterTurns` dispatches `monsterTurn` 700 ms after the monster
  becomes active, in an effect with cleanup (leaving the page cancels a pending turn).
- **Result is sent exactly once:** when the status leaves `Running`, `useSubmitFightResult` posts
  the outcome (a ref guards against a second send, also in StrictMode). The answer's
  `reward.character` replaces the cached character with `setQueryData`, so the top bar and the
  character page show the new XP and level at once. If the request fails, the dialog shows the
  error and a "Try again" button.
- **Log and texts:** the engine logs data (`FightEvent`); `describeFightEvent` turns it into a
  sentence with the texts in `i18n/en.ts` (`fight.*`).
- **Stats on screen:** HP and mana bars, attack and defense with the sum of all fight bonuses
  next to the value (green `+3`, red `−2`, `+0` in the normal color), speed on the turn-order bar.
- **Known limit:** leaving a running fight (other page, reload) ends it without a result. Fleeing
  is the way out that is reported to the server.

| File                                     | Content                                                      |
| ---------------------------------------- | ------------------------------------------------------------ |
| `components/fight/MonsterPicker.tsx`     | list of monsters, `MonsterCard` per monster                  |
| `components/fight/FightArena.tsx`        | owns the fight state (`useReducer`), wires everything        |
| `components/fight/CombatantPanel.tsx`    | name, level, HP / mana bars, attack and defense with bonuses |
| `components/fight/ActionBar.tsx`         | attack, defend, flee and one button per learned skill        |
| `components/fight/TurnTimeline.tsx`      | next actors and the speed of both fighters                   |
| `components/fight/FightLog.tsx`          | log of the fight (`fightLogText.ts` builds the sentences)    |
| `components/fight/FightResultDialog.tsx` | result overlay: waiting, error with retry, reward            |
| `hooks/useMonsters.ts` and others        | monsters query, monster turn timer, submit fight result      |

## Skills

`pages/SkillsPage.tsx` (`/characters/:characterId/skills`) lists the skills of the hero's class and
lets the player spend skill points. The page only checks that the hero exists; `SkillsPanel` owns
the data (same split as `FightPage` → `FightArena`).

- **Three states per skill** (`game/skillState.ts`, a pure function): learned, learnable, locked
  (reason: required level or not enough skill points). It is only a hint for the screen: the server
  checks every rule again when the player clicks "Learn" and decides.
- **Data:** `useClassSkills` (`GET /api/classes/{classId}/skills`, public, cached once per class)
  and `useLearnSkill` (`POST /api/characters/{characterId}/skills`).
- **Cache:** the answer is the complete updated character. `useLearnSkill` puts it into the
  `myCharacter` cache with `setQueryData` (same pattern as the fight reward), so skill points, the
  top bar and the learned skills update at once. The next fight reads `learnedSkills` from the same
  character, so the action bar shows the new skill without any change.
- **Errors:** own texts instead of server messages (`character/learnSkillError.ts`). 400 and 409
  mean the screen was out of date, so the character is reloaded. While a request runs, all "Learn"
  buttons are disabled.
- **Accessibility:** a locked skill shows its reason as visible text (linked with
  `aria-describedby`), the buttons read "Learn <name>" for screen readers, and the success message
  sits in a live region.

| File                                          | Content                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `components/skills/SkillsPanel.tsx`           | class skills query, learn mutation, cards, messages     |
| `components/skills/SkillCard.tsx`             | one skill with its state, cost and button               |
| `components/ui/SkillTypeBadge.tsx`            | Damage / Heal / Buff label (also on the character page) |
| `hooks/useClassSkills.ts`, `useLearnSkill.ts` | skills of a class, learn a skill                        |
| `game/skillState.ts`                          | learned / learnable / locked                            |
| `character/learnSkillError.ts`                | error text for a failed learn request                   |

## Folder structure

Folders are created together with their first file.

```
src/
  main.tsx, App.tsx   # entry point, providers, routes
  styles/             # global styles, Tailwind + daisyUI themes (design tokens)
  theme/              # dark/light theme hook and toggle
  game/               # data-driven registries (classes, stats) with fallbacks, skill states
    fight/            # pure fight engine (reducer) with its tests
  i18n/               # all UI texts in one place
  api/                # API layer: types, client, HTTP + mock implementation
  auth/               # auth state, protected routes, form schemas, demo account
  character/          # character form schema and error mapping (also for learning skills)
  hooks/              # data hooks (TanStack Query)
  lib/                # app-wide setup and helpers (query client, humanize)
  components/
    layout/           # top bar, page layouts (app, auth, landing), footer
    landing/          # landing page sections (hero, features and classes)
    character/        # character parts (class card, overview, rename, delete dialog …)
    fight/            # fight screen parts (arena, panels, action bar, timeline, log, result dialog)
    skills/           # skills page parts (panel, skill card)
    ui/               # reusable UI parts (class badge, stat bar, form alert, submit button …)
  pages/              # one component per route
```

## Conventions

- **Exact dependency versions** (no `^`/`~`); `.npmrc` enforces `save-exact`.
- **Formatting:** Prettier (`.prettierrc.json`); ESLint only checks code quality.
- **Styling:** only theme colors and design tokens, never raw color values.
- **Icons:** [Lucide](https://lucide.dev) (`lucide-react`); class icons are mapped in `src/game/classVisuals.ts`.
- **Texts:** all UI texts live in `src/i18n/en.ts`; components use `t` from `src/i18n`.
- **Game data is open:** class ids and stat keys come from the API as plain strings; unknown values render with a fallback.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(front-end): …`.
