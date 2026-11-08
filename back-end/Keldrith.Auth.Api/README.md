# Keldrith API

ASP.NET Core 10 Minimal API with EF Core (SQLite) and JWT authentication for the Keldrith front-end.

## Endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Register and immediately sign in |
| POST | `/api/auth/login` | – | Sign in |
| GET | `/api/auth/me` | JWT | Restore the current session |
| GET | `/api/classes` | – | List the playable classes |
| GET | `/api/classes/{classId}/skills` | – | List the skills of one class, lowest required level first (404 for an unknown class) |
| GET | `/api/monsters` | JWT | List the monsters (with XP reward and skills) |
| GET | `/api/characters` | JWT | Own characters (zero or one) |
| GET | `/api/characters/{id}` | JWT | One own character |
| POST | `/api/characters` | JWT | Create the character (one per user) |
| PUT | `/api/characters/{id}` | JWT | Rename the character |
| DELETE | `/api/characters/{id}` | JWT | Delete the character |
| POST | `/api/characters/{id}/fight-results` | JWT | Report a fight; the server decides the reward |
| POST | `/api/characters/{id}/skills` | JWT | Learn a skill with skill points (`{ "skillId": "war-cry" }`), returns the updated character |

JSON is camelCase, enums are strings (`"Damage"`, `"Won"`). The DTOs match the front-end types in `front-end/src/api/types.ts`.

## Rules

- **Server-authoritative:** the client only reports `{ npcId, outcome, turns }`. XP comes from the monster in the database, only `Won` pays.
- Level-up: `XpToNextLevel(level) = 50 * (level + 1)`, several level-ups at once are possible, +1 skill point per level-up, max level 10 (no XP gained there).
- **Learn skill:** the first broken rule decides the answer, checked in this order: own character (else 404) → skill belongs to the character's class (400, `errors.skillId`) → not learned yet (409) → required level reached (400) → enough skill points (400). Then the skill points are deducted and the skill is added. The front-end mock checks in the same order.
- Known limit: two parallel learn requests for *different* skills can both read the old skill points, so a player could get two skills for one point. The same skill twice is stopped by the database (409). A concurrency token (needs a migration) would close the gap.
- Stats are computed, never stored: `baseStats + statsPerLevel * (level - 1)`.
- Each user has at most one character (database unique index + endpoint check, second create → 409).
- A foreign or unknown character id always gives 404 (no hint that it exists).
- Username 3–20 characters, email valid, password at least 8 characters (stored as a salted hash), character name 2–20 characters.
- Errors are Problem Details; validation errors (400) carry an `errors` dictionary per field; conflicts are 409; wrong login is a generic 401.
- JWT lifetime: 8 hours; claims: `sub`, `name`, `role`.

## Run it

Install the .NET 10 SDK. From this folder:

```bash
dotnet tool restore
dotnet run
```

The app applies the committed migrations at startup and seeds the game data (4 classes, 12 player skills, 3 monsters, 4 monster skills) when the tables are empty. In Development it also creates the demo account `demo@keldrith.dev` / `demo-password` with one character. The database file `keldrith-auth.db` is created in this folder and is git-ignored. To start from scratch, stop the app and delete `keldrith-auth.db*`.

After a model change, create a migration and commit it:

```bash
dotnet ef migrations add <Name> --output-dir Data/Migrations
```

Back-end URL: `http://localhost:5080`. OpenAPI: `/openapi/v1.json`. Scalar UI: `/scalar` (Development only).

The front-end calls relative `/api` URLs; the Vite dev proxy forwards them to `http://localhost:5080`. Run it against this API with `VITE_USE_MOCKS=false` (for example in `front-end/.env.local`).

## Configuration

`appsettings.Development.json` contains a development-only JWT signing key. Never use it in production: set `Jwt__SigningKey` as a secret with at least 32 UTF-8 bytes. The EF Core design-time factory lets `dotnet ef` work without starting the API. The demo account is only created when the environment is `Development`.

## Not implemented yet

Admin endpoints, profile editing, account deletion.
