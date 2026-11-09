# Keldrith

A turn-based browser RPG. Players register, create a hero, learn skills, fight monsters and level up. The front-end is a React + TypeScript app, the back-end an ASP.NET Core Web API with SQLite.

| Folder       | Content                                | Details                                                                      |
| ------------ | -------------------------------------- | ---------------------------------------------------------------------------- |
| `front-end/` | React, TypeScript, Vite                | [front-end/README.md](front-end/README.md)                                   |
| `back-end/`  | ASP.NET Core Web API, SQLite, JWT auth | [back-end/Keldrith.Auth.Api/README.md](back-end/Keldrith.Auth.Api/README.md) |

## Run the demo

Requirements: Node.js (see `front-end/.nvmrc`) and the .NET 10 SDK.

**1. Start the back-end** (http://localhost:5080)

```bash
cd back-end/Keldrith.Auth.Api
dotnet tool restore
dotnet run
```

On first start the database is created, migrated and seeded (classes, skills, monsters and the demo account).

**2. Point the front-end at the real back-end**

Create `front-end/.env.local` (git-ignored):

```bash
VITE_USE_MOCKS=false
```

**3. Start the front-end** (http://localhost:5173)

```bash
cd front-end
npm install
npm run dev
```

Without `.env.local` the front-end uses a mock API in the browser, so it also runs without the back-end.

### Demo account (development only)

| Email               | Password        |
| ------------------- | --------------- |
| `demo@keldrith.dev` | `demo-password` |

The account has one hero (Aldric, Warrior, level 3). It is only created when the back-end runs in the `Development` environment.

### Reset the database

Stop the back-end, delete the database files, start it again:

```bash
cd back-end/Keldrith.Auth.Api
rm keldrith-auth.db*
dotnet run
```

All accounts and heroes are gone; the demo account is seeded again.
