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

Until the back-end is connected, login and character data are **mocked** (any email logs in).

## Folder structure

Folders are created together with their first file.

```
src/
  main.tsx, App.tsx   # entry point, providers, routes
  styles/             # global styles, Tailwind + daisyUI themes (design tokens)
  theme/              # dark/light theme hook and toggle
  game/               # data-driven registries (classes, stats) with fallbacks
  i18n/               # all UI texts in one place
  api/                # API types, client and mocks
  auth/               # auth context and protected routes
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
