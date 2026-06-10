# Architecture

## Overview

LiveTrack is a single Next.js 15 application deployed as a Cloudflare Worker (via OpenNext). It combines server-rendered UI, REST route handlers, and two Durable Objects for realtime coordination and rate limiting, backed by Cloudflare D1.

```
                        ┌──────────────────────────────────────────────┐
                        │              Cloudflare Worker                 │
  Browser  ── HTTPS ──▶ │  worker.ts                                     │
     │                  │   ├─ /realtime/ws  ──▶ LocationHub (DO)         │
     │                  │   └─ * ──▶ OpenNext (Next.js handler)           │
     │   WebSocket      │            ├─ Route handlers (/api/*)           │
     └───────(wss)──────┼────────────┤   ├─ services/  ──▶ D1 (SQLite)    │
                        │            │   └─ auth (Auth.js / JWT)          │
                        │            └─ React UI (RSC + client)           │
                        │  Durable Objects: LocationHub, RateLimiterDO    │
                        └──────────────────────────────────────────────┘
```

## Layers (clean architecture)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Presentation | `src/app`, `src/components`, `src/modules` | Routes, UI components, feature modules |
| Client logic | `src/hooks` | Sharing lifecycle, live-map subscription |
| API / controllers | `src/app/api` | Validation, authz, error envelope, audit |
| Domain services | `src/services` | Repository-style D1 access, DTO mapping |
| Cross-cutting | `src/lib` | crypto, validators, audit, rate limit, api helpers |
| Realtime | `src/realtime` | Durable Objects + WS upgrade routing |
| Data | `database/` | Migrations + seed |

Dependencies point inward: route handlers depend on services and `lib`; services depend only on the D1 binding and types. UI never touches D1 directly — it goes through the typed `client-api` fetch wrapper.

## Realtime design

The realtime path is intentionally separated from persistence:

1. **Ticket issuance** — the browser calls `GET /api/realtime/token?scope=publish|view` over authenticated HTTPS and receives a 60-second HMAC-signed ticket (WebSockets can't carry auth headers).
2. **Upgrade** — `worker.ts` intercepts `/realtime/ws`, verifies the ticket, and forwards the upgrade to the single `LocationHub` Durable Object with identity headers.
3. **Publish** — sharing clients stream `pos` messages. The hub throttles broadcasts (1/s) and persistence (1/3s) independently.
4. **Fan-out** — viewers (admin live map) receive position + lifecycle events.
5. **Hibernation** — the WebSocket Hibernation API keeps idle connections free.
6. **Stale sweep** — a DO alarm ends sessions with no updates for 5 minutes (`timeout`).

A REST fallback (`POST /api/location/update`) routes through the same hub, so persistence/broadcast logic is never duplicated.

### Why a single hub?

For free-tier scale a single coordination object simplifies viewer fan-out (all admins watch one stream). The design can shard by region/tenant by switching `getByName(REALTIME.HUB_NAME)` to a sharded key and aggregating viewer subscriptions — the message protocol already carries `sid`/`uid`.

## Authentication & sessions

- **Auth.js (NextAuth v5)** with a JWT session strategy.
- On sign-in, a **device session** row is created in D1 and its id is embedded in the JWT (`sid`). This is the server-side control plane: `requireUser()` checks the session is not revoked or expired on every request, giving JWTs revocability (logout, password change, admin disable, "sign out other devices").
- Passwords are hashed with **PBKDF2-SHA256** (100k iterations) via Web Crypto — portable across Workers/Node/browser.

## Authorization (RBAC)

Roles (`super_admin`, `admin`, `operator`, `viewer`, `user`) map to permissions in the `permissions` table (seeded, with a static fallback in `constants.ts`). `requirePermission()` enforces them server-side; middleware gates `/admin` at the edge; the UI hides controls the user can't use. Authorization is always re-checked server-side.

## Consent model

A `location_session` row stores `consent_granted_at` at creation and can only be created via an endpoint that requires `consent: true`. Both a "permission granted" and "session started" audit entry are written. Stopping writes "session stopped" (+ "permission revoked" for the owner). There is no code path that records location without an active, consented session.

## Data model

See `database/migrations/0001_init.sql`. Key tables: `users`, `roles`, `permissions`, `sessions` (devices), `location_sessions`, `locations`, `password_reset_tokens`, `audit_logs`. Foreign keys cascade on user deletion to guarantee erasure.

## Performance

- RSC + route-based code splitting; the map (Leaflet) is `dynamic({ ssr: false })` and only loads when needed.
- Static landing page; dynamic routes are server-rendered on demand.
- React Query caches and dedupes client fetches; the live map merges a 60s REST snapshot with the realtime stream.
- Edge execution puts compute close to users; D1 reads are indexed.
