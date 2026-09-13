# API Reference

Base URL: your deployment origin (e.g. `https://control.org.tr`).

All JSON responses use `{ ...data }` on success or `{ error: { code, message } }` on failure.

Authentication: session cookie from Auth.js (except public auth endpoints). Mutating requests require same-origin (`Origin` header must match host).

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET/POST` | `/api/auth/[...nextauth]` | — | Auth.js handlers (login, logout, OAuth) |
| `POST` | `/api/auth/register` | — | Register with email/password |
| `POST` | `/api/auth/password/forgot` | — | Request password reset email |
| `POST` | `/api/auth/password/reset` | — | Reset password with token |
| `POST` | `/api/auth/password/change` | ✅ | Change password (revokes other devices) |

### Register body

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Str0ngPass1" }
```

---

## Profile & devices

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/profile` | Current user profile |
| `PATCH` | `/api/profile` | Update name `{ "name": "..." }` |
| `DELETE` | `/api/profile` | GDPR erasure — delete account |
| `GET` | `/api/profile/export` | GDPR export — JSON download |
| `GET` | `/api/devices` | List active device sessions |
| `DELETE` | `/api/devices/:id` | Revoke a device session |

---

## Location sharing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/location/sessions` | History + active session (`?page=&pageSize=`) |
| `POST` | `/api/location/sessions` | Start sharing — **requires `{ "consent": true }`** |
| `GET` | `/api/location/sessions/:id` | Session detail + track points |
| `POST` | `/api/location/sessions/:id/stop` | Stop sharing immediately |
| `POST` | `/api/location/update` | REST position fallback |
| `GET` | `/api/realtime/token?scope=publish\|view` | WebSocket ticket (60s TTL) |

### Start session body

```json
{ "consent": true, "label": "Field visit" }
```

### Position update body

```json
{
  "sessionId": "uuid",
  "position": { "lat": 41.0, "lng": 29.0, "acc": 12, "ts": 1710000000000 }
}
```

### WebSocket

Connect: `wss://<host>/realtime/ws?ticket=<signed-ticket>`

Client → server (publish only):

```json
{ "t": "pos", "lat": 41.0, "lng": 29.0, "acc": 12, "ts": 1710000000000 }
```

---

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | List notifications + unread count |
| `POST` | `/api/notifications/read` | `{ "id": 1 }` or `{ "all": true }` |

---

## Admin

Requires RBAC permissions (see `SECURITY.md`).

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/api/admin/stats` | `stats.view` | Dashboard metrics |
| `GET` | `/api/admin/activity` | `stats.view` | Recent audit feed |
| `GET` | `/api/admin/sessions/active` | `sessions.view` | Active sessions snapshot |
| `GET` | `/api/admin/users` | `users.view` | List users (`?q=&role=&status=`) |
| `POST` | `/api/admin/users` | `users.create` | Create user |
| `PATCH` | `/api/admin/users/:id` | `users.manage` | Update role/status |
| `GET` | `/api/admin/audit` | `audit.view` | Audit log (`?action=&actor=`) |
| `GET` | `/api/admin/security/stats` | `audit.view` | Security metrics |
| `GET` | `/api/admin/security/events` | `audit.view` | Security events |
| `GET` | `/api/admin/risk/stats` | `risk.view` | Open, critical and resolved risk metrics |
| `GET` | `/api/admin/risk/events` | `risk.view` | Risk events (`?status=&severity=&source=&type=&subject=`) |
| `POST` | `/api/admin/risk/events` | `risk.manage` | Create a manual risk event |
| `POST` | `/api/admin/risk/events/:id/acknowledge` | `risk.manage` | Acknowledge an open risk event |
| `POST` | `/api/admin/risk/events/:id/resolve` | `risk.manage` | Resolve an open or acknowledged risk event |
| `GET` | `/api/admin/wallets/stats` | `wallets.view` | Wallet counts and balances by currency |
| `GET` | `/api/admin/wallets` | `wallets.view` | Wallets (`?q=&userId=&type=&status=&currency=`) |
| `POST` | `/api/admin/wallets` | `wallets.manage` | Create a user wallet |
| `POST` | `/api/admin/wallets/:id/status` | `wallets.manage` | Freeze, unfreeze or archive a wallet |
| `GET` | `/api/admin/wallets/transactions` | `wallets.view` | Wallet ledger (`?walletId=&userId=`) |
| `POST` | `/api/admin/wallets/transfer` | `wallets.manage` | Transfer balance between wallets |
| `POST` | `/api/admin/wallets/transfers/:id/reverse` | `wallets.manage` | Reverse a posted wallet transfer |

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | `{ status, checks: { app, database, realtime } }` |

---

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `unauthorized` | 401 | Not signed in or session revoked |
| `forbidden` | 403 | Missing permission |
| `not_found` | 404 | Resource missing |
| `bad_request` | 400 | Validation failed |
| `rate_limited` | 429 | Too many requests |
| `csrf` | 403 | Cross-origin mutation rejected |
