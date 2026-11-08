# Keldrith Auth API

ASP.NET Core 10 Minimal API for the current Keldrith frontend authentication flow.

## Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register and immediately sign in |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Restore current session (JWT required) |

The JSON response follows the frontend `AuthResponse` and `UserDto` types: `token`, `expiresAt`, and `user` (`userId`, `username`, `email`, `role`).

## Rules

- Username: trimmed, 3–20 characters, case-insensitive uniqueness.
- Email: trimmed, max 254 characters, case-insensitive uniqueness.
- Password: minimum 8 characters; never trimmed; stored as a salted password hash.
- Duplicate username/email: HTTP 409 with `errors.username` and/or `errors.email`.
- Invalid request: HTTP 400 Problem Details with field errors.
- Wrong login credentials: HTTP 401 with a generic message.
- JWT lifetime: 8 hours; claims: `sub`, `name`, `role`.

## First-time setup

Install the .NET 10 SDK. From this folder run:

```bash
dotnet tool restore
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

The app applies committed migrations at startup. Generate the initial migration once and commit `Data/Migrations` to source control.

Backend URL: `http://localhost:5080`. OpenAPI: `/openapi/v1.json`. Scalar: `/scalar` (Development only).

The frontend calls relative `/api` URLs. Configure Vite's proxy to forward `/api` to `http://localhost:5080` (or your selected backend port).

`appsettings.Development.json` contains a development-only JWT signing key. The EF Core design-time factory keeps `dotnet ef` from starting the API while creating migrations. Never use it in production. Configure `Jwt__SigningKey` as a secret with at least 32 UTF-8 bytes in production.

This initial backend intentionally does not yet implement character, game-data, profile-editing, or account-deletion endpoints.
