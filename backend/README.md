# Shopping list — AI proxy backend

Small Express service that holds `ANTHROPIC_API_KEY` and forwards recipe import, meal-plan PDF import, and shopping-list grouping to Anthropic. The Expo app never sees the Anthropic key.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `ANTHROPIC_API_KEY` — your Anthropic API key (server-side only).
- `CLIENT_TOKEN` — optional. If set, clients must send `Authorization: Bearer <same value>`.
- `PORT` — default `3000`.
- `ALLOWED_ORIGINS` — comma-separated list for browser CORS, or `*` for any origin (dev only). Requests with no `Origin` (typical for React Native) are allowed when using a list.

## Run

```bash
npm run dev
```

Health check: `GET http://localhost:3000/health`

## Endpoints

All routes are `POST`, JSON body, under `/api`.

| Path | Purpose |
|------|---------|
| `/api/recipes/import-from-photos` | Images as base64 + language hints → recipe JSON |
| `/api/meal-plans/import-from-pdf` | PDF as base64 → recipes JSON |
| `/api/shopping-list/group` | Product names + localized prompts → category groups |

### Example: import from photos

```bash
curl -sS -X POST http://localhost:3000/api/recipes/import-from-photos \
  -H 'Content-Type: application/json' \
  -d '{"images":[{"mediaType":"image/jpeg","data":"..."}],"languageName":"Polish","languageInstruction":"Use Polish for all text."}'
```

### Example: group shopping list

```bash
curl -sS -X POST http://localhost:3000/api/shopping-list/group \
  -H 'Content-Type: application/json' \
  -d '{"productNames":["mleko","chleb"],"categoryDescription":"Nazwa kategorii po polsku","instruction":"..."}'
```

## Expo app configuration

In the repo root `.env`:

- `EXPO_PUBLIC_BACKEND_URL` — e.g. `http://localhost:3000` (simulator) or `http://<your-LAN-IP>:3000` (device).
- `EXPO_PUBLIC_BACKEND_TOKEN` — set if `CLIENT_TOKEN` is set on the backend.

## Production notes

- Use HTTPS and a strong `CLIENT_TOKEN` (or replace with proper auth).
- Consider rate limiting and request size limits appropriate for your hosting.
