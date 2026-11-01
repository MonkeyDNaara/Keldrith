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
  components/
    layout/           # top bar, page layout
    ui/               # reusable UI parts (buttons, bars, cards)
    icons/            # SVG icon components
  pages/              # one component per route
```

## Conventions

- **Exact dependency versions** (no `^`/`~`); `.npmrc` enforces `save-exact`.
- **Formatting:** Prettier (`.prettierrc.json`); ESLint only checks code quality.
- **Styling:** only theme colors and design tokens, never raw color values.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(front-end): …`.
