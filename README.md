# LiveTrack — Consent-First Real-Time Location Sharing

LiveTrack is an enterprise-grade platform for sharing live location **only with explicit user consent**, with full audit trails, role-based administration, and GDPR/KVKK-compliant data handling. It runs entirely on Cloudflare's free tier.

> **Privacy by design.** Nothing is ever transmitted until a user grants their browser's geolocation permission *and* accepts an in-app consent screen. There is no silent, hidden, or background tracking. Users can stop sharing at any moment, export all of their data, and permanently delete their account.

---

## Highlights

- **Consent-first sharing** — explicit, timestamped consent stored per session.
- **Instant stop** — stopping halts transmission immediately, client- and server-side.
- **Realtime** — WebSockets over Cloudflare Durable Objects, with a REST fallback.
- **Live admin map** — OpenStreetMap + Leaflet, real-time markers, search & filtering.
- **RBAC** — Super Admin, Admin, Operator, Viewer roles with granular permissions.
- **Full audit log** — append-only record of every auth, consent, session, and admin action.
- **GDPR/KVKK** — data export (right of access) and account erasure (right to be forgotten).
- **Security** — JWT sessions with server-side revocation, PBKDF2 hashing, CSP, CSRF & rate limiting.
- **Light/dark mode**, mobile-first responsive UI, skeleton loaders, empty & error states.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, shadcn-style UI, React Query |
| Backend | Next.js Route Handlers on Cloudflare Workers (via OpenNext) |
| Database | Cloudflare D1 (SQLite) |
| Realtime | WebSocket + Cloudflare Durable Objects |
| Auth | Auth.js (NextAuth v5) — Google OAuth + email/password |
| Maps | OpenStreetMap tiles + Leaflet |
| Deploy | Cloudflare Workers + Pages (OpenNext adapter) |

## Project structure

```
src/
  app/                # App Router routes
    (marketing)/      # Public landing page
    (auth)/           # Login, register, password reset
    (app)/            # Authenticated app (dashboard, history, settings, admin)
    api/              # REST API route handlers
  components/         # Reusable UI (ui/, layout/, auth/, map/)
  modules/            # Feature modules (location, settings, auth, admin)
  services/           # Data-access / repository layer (D1)
  hooks/              # Client hooks (sharing, live map)
  lib/                # Cross-cutting concerns (crypto, api, audit, validators…)
  realtime/           # Durable Objects (LocationHub, RateLimiterDO) + WS upgrade
  types/              # Shared types
auth/ -> src/auth     # Auth.js configuration
database/             # D1 migrations + seed
tests/                # unit (vitest) + e2e (playwright)
```

## Quick start

```bash
# One-command local bootstrap
./scripts/setup.sh

# 2. Configure secrets
cp .dev.vars.example .dev.vars   # for wrangler dev / preview
cp .env.example .env.local       # for `next dev`
#   set AUTH_SECRET:  openssl rand -base64 32

# 3. Create the local D1 database and apply migrations + seed
npx wrangler d1 create livetrack-db   # paste the database_id into wrangler.jsonc
npm run db:migrate:local
npm run db:seed:local

# 4. Create a super admin
node scripts/create-admin.mjs --email you@example.com --password 'ChangeMe123!'

# 5. Run with full Cloudflare bindings (recommended)
npm run preview      # builds with OpenNext + runs wrangler dev (http://localhost:8787)

#   …or run the plain Next.js dev server (no DO/D1 bindings)
npm run dev          # http://localhost:3000
```

See [INSTALLATION.md](./INSTALLATION.md) for the detailed walk-through, [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for **fully automated** CI/CD bootstrap, and [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment (including connecting a custom domain).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run preview` | OpenNext build + `wrangler dev` (real bindings) |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:migrate:local` / `:remote` | Apply D1 migrations |
| `npm run db:seed:local` / `:remote` | Seed roles & permissions |
| `./scripts/setup.sh` | Install + migrate + seed (local) |
| `npm run infra:bootstrap` | One-shot: D1 + secrets + deploy + GitHub push |

### Optional: Telegram admin alerts

When a user **explicitly starts** location sharing, admins can receive a Telegram message with a Google Maps link. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` in `.dev.vars` / `wrangler secret put`. This only fires on consented session start — never on page visit or silent tracking.

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) — local setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment & custom domain
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
- [API_REFERENCE.md](./API_REFERENCE.md) — REST API
- [SECURITY.md](./SECURITY.md) — security & compliance model

## License

Provided as-is for your own deployment. You are the data controller for any instance you operate; configure retention and policies to match your legal obligations.
