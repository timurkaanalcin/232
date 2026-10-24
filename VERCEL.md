# Deploying LiveTrack on Vercel (PostgreSQL)

This branch runs LiveTrack as a standard Next.js app on Vercel serverless
functions instead of Cloudflare Workers.

| Cloudflare (main)              | Vercel (this branch)                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| D1 (SQLite)                    | PostgreSQL via `pg` + D1-compatible shim (`src/node-runtime/pg-d1.ts`) |
| `LocationHub` Durable Object   | Stateless hub: DB-throttled persistence, lazy stale-session sweep |
| WebSocket `/realtime/ws`       | Not available: clients use REST `/api/location/update`; admin map polls every 3 s |
| `RateLimiterDO`                | Fixed-window counters in the `rate_limits` table                   |
| DO alarm sweep                 | Lazy sweep (≤ 1/min per instance) + daily Vercel Cron `/api/cron/sweep` |

The schema is created automatically on first DB access (idempotent, advisory
locked). It is generated from `database/migrations/*.sql` + `database/seed.sql`:

```bash
npm run db:gen-pg   # regenerates src/node-runtime/pg-schema.generated.ts
```

## Environment variables

Required: `DATABASE_URL` (or `POSTGRES_URL`, e.g. from the Neon integration),
`AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_SITE_URL`.

Optional: `CRON_SECRET` (protects `/api/cron/sweep`), `LIVETRACK_ADMIN_EMAILS`
(comma-separated, promoted to `super_admin` on cold start), `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `PG_POOL_MAX` (default 5).
