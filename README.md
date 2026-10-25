# LiveTrack — Consent-First Real-Time Location Sharing

LiveTrack is an enterprise-grade platform for sharing live location **only with explicit user consent**, with full audit trails, role-based administration, and GDPR/KVKK-compliant data handling. It runs entirely on Cloudflare's free tier.

> **Privacy by design.** Nothing is ever transmitted until a signed-in user accepts an in-app consent screen and then the platform location prompt (the browser prompt on the web, the system prompt in the mobile app). There is no silent, hidden, or background tracking, and no guest auto sign-in. Users can stop sharing at any moment, export all of their data, and permanently delete their account. The Android app keeps a persistent notification on screen for the whole session.

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

## Mobile app

The `mobile/` directory is a Capacitor shell around this same web app. It does not reimplement auth, the dashboard, history, or the API. The WebView loads your LiveTrack server. Native code adds the OS location prompt and, on Android, a foreground-service notification with a **Stop sharing** action.

Location collection still starts only after the signed-in user accepts the consent screen. The app does not request “always” / background location, does not start on boot, and has no hidden or disguised mode.

### What you need to provide

| Need | Why |
|------|-----|
| LiveTrack server URL | The app has no bundled backend. Use the HTTPS origin of your deployment. |
| Android signing keystore | Only for a **release** build you ship yourself. Debug APKs use the automatic debug keystore. |
| Apple Developer account | Required to install the iOS app on a physical device or ship it. A Mac with Xcode is required to build iOS. |
| Google sign-in | Optional. Email and password work in the app. Google blocks OAuth inside embedded WebViews, so Google sign-in may fail in the app even when it works in a browser. |

### Point the app at the backend

Either bake the URL in at build time:

```bash
cd mobile
npm ci
LIVETRACK_SERVER_URL=https://your-host.example npm run sync
```

Or leave it unset. The first screen then asks for the server URL. You can change it later in **Settings → LiveTrack server**. That screen does not ask for location.

Examples for a dev server on your computer:

- Android emulator: `http://10.0.2.2:3000` (`npm run dev`) or `http://10.0.2.2:8787` (`npm run preview`)
- A phone on the same network: `http://<your-LAN-ip>:3000` (the dev server must listen on `0.0.0.0`)

Debug Android builds allow plain HTTP so those local servers work. Release Android builds allow HTTPS only. iOS allows HTTP to the local network and HTTPS everywhere else. Production should be HTTPS.

The URL must be an origin with no path, query, or password (`https://host` or `http://host:port`).

### Android

Prerequisites: JDK 21, Android SDK 36 (Android Studio is the easiest way to install it).

```bash
cd mobile
npm ci
LIVETRACK_SERVER_URL=https://your-host.example npm run sync:android
npm run apk:debug
```

The debug APK is written to `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Open the project in Android Studio with `npm run open:android` from `mobile/`.

CI (`.github/workflows/android.yml`) uploads that debug APK as `livetrack-debug-apk` on pull requests. Set the repository variable `LIVETRACK_SERVER_URL` to bake the origin into that artifact. If the variable is empty, install the APK and enter the URL on first launch.

While sharing is on, Android shows an ongoing notification: **LiveTrack is sharing your location**. Stop sharing from that notification or from the app. If the device lets you dismiss the notification, that stops sharing too. The service is not sticky and is not started on boot.

### iOS

Prerequisites: a Mac with Xcode, CocoaPods not required (the project uses Swift Package Manager), and an Apple Developer account for a physical device.

```bash
cd mobile
npm ci
LIVETRACK_SERVER_URL=https://your-host.example npm run sync:ios
npm run open:ios
```

Run the **App** scheme from Xcode on a simulator or a signed device. The project requests when-in-use location only. iOS shows the system location indicator while LiveTrack is open and sharing. Leaving the app pauses updates; the server ends the session after 5 minutes without a position. There is no always-on background mode.

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) — local setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment & custom domain
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
- [API_REFERENCE.md](./API_REFERENCE.md) — REST API
- [SECURITY.md](./SECURITY.md) — security & compliance model

## License

Provided as-is for your own deployment. You are the data controller for any instance you operate; configure retention and policies to match your legal obligations.
