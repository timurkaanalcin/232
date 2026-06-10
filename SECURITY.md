# Security & Compliance

## Consent model

LiveTrack never records location without:

1. **Browser geolocation permission** (OS-level prompt)
2. **In-app consent** (`POST /api/location/sessions` with `consent: true`)
3. An **active `location_sessions` row** with `consent_granted_at` timestamp

Stopping sharing ends the session server-side, closes the publisher WebSocket, and writes audit + notification entries. There is no background or hidden tracking path.

## Authentication

- **Auth.js** with JWT strategy and **server-side device sessions** (`sessions` table).
- Every API call via `requireUser()` validates the JWT `sid` is not revoked/expired.
- Passwords: **PBKDF2-SHA256**, 100k iterations (Web Crypto).
- Google OAuth optional; disabled accounts cannot sign in via any provider.

## Transport & headers

Configured in `next.config.ts`:

- **Content-Security-Policy** — restricts scripts, connects (incl. `wss:`), images (OSM tiles only).
- **Strict-Transport-Security** — HTTPS preload.
- **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — `geolocation=(self)` only for this origin.

## CSRF & XSS

- Session cookies: `SameSite=Lax`, `Secure` in production.
- Mutating API routes call `assertSameOrigin()` — rejects cross-origin `Origin` headers.
- React auto-escapes output; CSP limits inline script in production.
- All DB queries use **parameterized** D1 prepared statements.

## Rate limiting

Distributed via **RateLimiterDO** (Durable Object), keyed per IP/user/action:

| Scope | Limit |
|-------|-------|
| Login | 10 / 5 min per IP |
| Register | 5 / hour per IP |
| Password reset | 5–10 / 15 min |
| Location update | 120 / min per user |
| General API | 300 / min |

Exceeded limits log a `security_events` row and return HTTP 429.

## Authorization (RBAC)

| Role | Capabilities |
|------|-------------|
| `super_admin` | Full access incl. role assignment |
| `admin` | User management, audit, live map |
| `operator` | Live map, session management |
| `viewer` | Read-only live map + stats |
| `user` | Own profile, sharing, history |

Permissions enforced server-side on every admin endpoint.

## Audit & security events

**Audit log** (`audit_logs`) — append-only trail of user-visible actions: login, consent, sessions, admin views.

**Security events** (`security_events`) — failed logins, rate limits, suspicious patterns. Visible in `/admin/security`.

## GDPR / KVKK

| Right | Implementation |
|-------|----------------|
| Consent | Timestamped per session; revocable instantly |
| Access | `GET /api/profile/export` — full JSON export |
| Erasure | `DELETE /api/profile` — cascades all user data |
| Minimization | Points only while session active; throttled persistence |
| Transparency | Audit log + in-app notifications |

## WebSocket security

- Short-lived **HMAC-signed tickets** (60s) — no long-lived tokens in query strings beyond ticket TTL.
- Publish scope requires user's own active session.
- View scope requires `map.live_view` permission.

## Secrets management

- `AUTH_SECRET`, OAuth secrets, email API keys via `wrangler secret put` / `.dev.vars` (git-ignored).
- Never commit `.env`, `.dev.vars`, or tokens.

## Incident response checklist

1. Revoke compromised user: disable account in admin panel (kills sessions + sharing).
2. Rotate `AUTH_SECRET` → forces re-login everywhere.
3. Review `/admin/security` and `/admin/audit` for the incident window.
4. Export affected user data if legally required.
