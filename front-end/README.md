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

| Script                 | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload                  |
| `npm run build`        | Type-check and build for production into `dist/`      |
| `npm run preview`      | Serve the production build locally                    |
| `npm run lint`         | Lint all files with ESLint                            |
| `npm run format`       | Format all files with Prettier                        |
| `npm run format:check` | Check formatting without changing files               |
| `npm run typecheck`    | Type-check only                                       |
| `npm run check`        | Lint + format check + build – run this before each PR |

## Routes

| Path                              | Page                                                  | Access    |
| --------------------------------- | ----------------------------------------------------- | --------- |
| `/login`, `/register`             | Login / register                                      | public    |
| `/`                               | Redirect: no character → create, else → the character | logged in |
| `/characters/new`                 | Create character                                      | logged in |
| `/characters/:characterId`        | Character detail                                      | logged in |
| `/characters/:characterId/fight`  | Fight                                                 | logged in |
| `/characters/:characterId/skills` | Skills                                                | logged in |
| `/styleguide`                     | Token and component preview                           | dev only  |
| `*`                               | Not found                                             | public    |

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

## Folder structure

Folders are created together with their first file.

```
src/
  main.tsx, App.tsx   # entry point, providers, routes
  styles/             # global styles, Tailwind + daisyUI themes (design tokens)
  theme/              # dark/light theme hook and toggle
  game/               # data-driven registries (classes, stats) with fallbacks
  i18n/               # all UI texts in one place
  api/                # API layer: types, client, HTTP + mock implementation
  auth/               # auth state, protected routes, form schemas, demo account
  hooks/              # data hooks (TanStack Query)
  lib/                # app-wide setup (query client)
  components/
    layout/           # top bar, page layout
    ui/               # reusable UI parts (class badge, stat bar …)
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
