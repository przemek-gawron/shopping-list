# Shopping list — AI proxy backend

Express service that holds `ANTHROPIC_API_KEY` and forwards recipe import, meal-plan PDF import, and shopping-list grouping to Anthropic. It also provides **user accounts** (email/password + Google, Apple, Facebook) and **JWT** protection for all `/api` routes (except the public auth routes). The Expo app never sees the Anthropic key.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `ANTHROPIC_API_KEY` — Anthropic API key (server-side only).
- `JWT_SECRET` — long random string used to sign user session JWTs. **Required** for sign-in; without it, `/api/auth/register` and other auth routes return 503.
- `GOOGLE_CLIENT_IDS` — comma-separated list of **Google OAuth client IDs** (Web, iOS, Android) so ID tokens with `aud` set to any of them are accepted.
- `APPLE_CLIENT_ID` — your Sign in with Apple **Services ID** (web) or **iOS bundle identifier**; must match the client that issues the `identityToken`.
- `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` — Facebook app credentials for token validation and profile fetch.
- `DB_PATH` — optional, absolute or relative path to the SQLite file (default `./data/app.db`).
- `PORT` — default `3000`.
- `ALLOWED_ORIGINS` — comma-separated CORS list, or `*` for all (dev only). React Native often sends no `Origin`; that is still allowed when using a list.

A SQLite file is created on first run under `data/` (add `data/` to `.gitignore` in dev).

## Run

```bash
npm run dev
```

Health check: `GET http://localhost:3000/health`

## Public auth routes (no `Authorization` header)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/auth/register` | `{ "email", "password", "displayName" }` | `{ "token", "user" }` |
| `POST` | `/api/auth/login` | `{ "email", "password" }` | `{ "token", "user" }` |
| `POST` | `/api/auth/oauth` | `{ "provider": "google" \| "apple" \| "facebook", "idToken" }` or `{ "provider": "facebook", "accessToken" }` | `{ "token", "user" }` |

## Authenticated

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/auth/me` | `Authorization: Bearer <jwt>` — returns `{ "user" }` |
| `POST` | `/api/recipes/import-from-photos` | same bearer token |
| `POST` | `/api/meal-plans/import-from-pdf` | same |
| `POST` | `/api/shopping-list/group` | same |

### Example: register then call AI (bash)

```bash
TOKEN=$(curl -sS -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password12","displayName":"Test"}' | jq -r .token)

curl -sS -X POST http://localhost:3000/api/recipes/import-from-photos \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"images":[{"mediaType":"image/jpeg","data":"..."}],"languageName":"Polish","languageInstruction":"Use Polish for all text."}'
```

## Expo app configuration

In the repo root `.env` (see root `.env.example`):

- `EXPO_PUBLIC_BACKEND_URL` — e.g. `http://localhost:3000` (simulator) or `http://<LAN-IP>:3000` (device).
- `EXPO_PUBLIC_GOOGLE_*` / `EXPO_PUBLIC_FACEBOOK_APP_ID` — for native/web OAuth; must match the apps configured in Google / Facebook / Apple developer consoles. Server env `GOOGLE_CLIENT_IDS` and OAuth providers must use the same project/app IDs.

`EXPO_PUBLIC_BACKEND_TOKEN` is **removed**; the app sends the **JWT** from `/api/auth/*` on every `POST` to protected routes.

## Production notes

- Use HTTPS, a strong `JWT_SECRET`, and secure storage of third-party app secrets.
- Consider rate limiting and request size limits appropriate for your hosting.
