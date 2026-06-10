# Installation Guide

This guide gets LiveTrack running locally with full Cloudflare bindings.

## Prerequisites

- **Node.js 20+** (22 recommended) and npm
- A **Cloudflare account** (free tier is sufficient)
- `npx wrangler login` access (for remote D1) — optional for local-only dev

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

LiveTrack reads secrets from two places depending on how you run it:

- `.dev.vars` — used by `wrangler dev` / `npm run preview` (the realistic path).
- `.env.local` — used by the plain `next dev` server.

```bash
cp .dev.vars.example .dev.vars
cp .env.example .env.local
```

Generate an auth secret and set it in **both** files:

```bash
openssl rand -base64 32
```

| Variable | Required | Notes |
|----------|----------|-------|
| `AUTH_SECRET` | ✅ | JWT signing + WS ticket signing secret |
| `AUTH_URL` | ✅ | App origin (`http://localhost:8787` for preview, `:3000` for dev) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ➖ | Enables Google login. Without it, email/password still works |
| `RESEND_API_KEY` / `EMAIL_FROM` | ➖ | Enables password-reset emails. Without it, reset links are logged server-side |

### Google OAuth (optional)

1. Create OAuth credentials at <https://console.cloud.google.com/apis/credentials>.
2. Authorized redirect URI: `http://localhost:8787/api/auth/callback/google` (and your production URL).
3. Put the client id/secret in `.dev.vars` and `.env.local`.

## 3. Create the D1 database

```bash
npx wrangler d1 create livetrack-db
```

Copy the printed `database_id` into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "livetrack-db", "database_id": "<paste-here>", "migrations_dir": "database/migrations" }
]
```

## 4. Apply migrations & seed

```bash
npm run db:migrate:local   # creates all tables
npm run db:seed:local      # inserts roles + permissions
```

## 5. Create a super admin

```bash
node scripts/create-admin.mjs --email you@example.com --password 'ChangeMe123!' --name "Your Name"
```

This produces a PBKDF2 hash identical to the runtime format and upserts a `super_admin` user.

## 6. Run

```bash
# Recommended: real D1 + Durable Objects bindings
npm run preview      # http://localhost:8787

# Or the lightweight Next dev server (no DO/D1 — UI work only)
npm run dev          # http://localhost:3000
```

> Durable Objects (the realtime WebSocket hub and rate limiter) only run under `wrangler dev` / `npm run preview`, **not** under `next dev`. Use `npm run preview` to exercise live location sharing locally.

## 7. Verify

```bash
npm run typecheck
npm run lint
npm test
```

Open the app, register or sign in, and press **Start sharing** to test the consent + geolocation flow. Sign in as the super admin to access `/admin`.

## Docker (alternative dev environment)

```bash
cp .env.example .env.local   # set AUTH_SECRET
docker compose up --build    # Next dev server on http://localhost:3000
```

The Docker path runs the Next.js dev server (no DO/D1 bindings); use the native `npm run preview` for full realtime testing.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `database_id` errors | Ensure you pasted the real id from `wrangler d1 create` |
| Login fails silently | `AUTH_SECRET` must be set and identical across config files |
| WebSocket won't connect under `next dev` | Expected — use `npm run preview` for Durable Objects |
| Google button missing | `GOOGLE_CLIENT_ID`/`SECRET` not set — email/password still works |
