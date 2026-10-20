# AGENTS.md

## Cursor Cloud specific instructions

This repo is **LiveTrack** (branded `borsahatti` in wrangler/UI): a Next.js 15 (App Router,
React 19, TypeScript) consent-first location-sharing app that deploys to Cloudflare Workers via
the OpenNext adapter. Data lives in Cloudflare **D1** (SQLite); realtime uses **Durable Objects**.
Standard commands live in `package.json` scripts and `README.md`/`INSTALLATION.md` — refer to those
rather than duplicating them. Notes below are the non-obvious things that bite you.

### Running the app
- `npm run dev` (Next dev server, http://localhost:3000) is the working development path in this
  environment. `next.config.ts` calls `initOpenNextCloudflareForDev()`, so **D1 bindings work under
  `next dev`** (secrets are read from `.dev.vars`). This is why login/registration/DB all work at
  `:3000` even though the README implies `next dev` has no bindings.
- **Durable Objects do not run under `next dev`** (you'll see harmless startup warnings about
  `LocationHub`/`RateLimiterDO`). The realtime WebSocket location hub and rate limiter only work
  under `npm run preview` (`opennextjs-cloudflare build` + `wrangler dev` at http://localhost:8787).
- Secrets: `.dev.vars` (used by wrangler/`preview`) and `.env.local` (used by `next dev`) each need
  `AUTH_SECRET`. Both files are git-ignored and are already created in this environment. If missing,
  copy from `.dev.vars.example` / `.env.example` and set `AUTH_SECRET=$(openssl rand -base64 32)`.

### Local database (D1)
- Local D1 state lives under `.wrangler/` (git-ignored) and is already migrated + seeded here.
- To recreate from scratch: `npm run db:migrate:local` then `npm run db:seed:local`. Both wrangler
  commands are interactive by default — prefix with `CI=1` (or run non-interactively) so they use
  the "yes" fallback instead of hanging on a TTY prompt.
- Create/reset an admin: `node scripts/create-admin.mjs --email you@example.com --password 'ChangeMe123!'`
  (defaults to the local DB; writes via `wrangler d1 execute`). A super admin
  (`admin@livetrack.dev`) already exists in the local DB.

### Tests, lint, build
- `npm test` (Vitest unit tests) passes and is the reliable automated-test signal.
- `npm run lint` passes (warnings only).
- **Known pre-existing failure (not an environment issue):** `npm run typecheck` and `npm run build`
  currently fail. The committed nested Vite project under `_zip_review/brokerz` is pulled in by the
  root `tsconfig.json` `**/*.ts` glob, but its `@/*` alias resolves to the main app's `src`, so its
  imports (e.g. `@/components/Layout`) don't type-check. This breaks `tsc --noEmit` and the
  `next build` type-check phase. Consequences: `npm run preview`, `npm run deploy`, and the Playwright
  e2e suite (`npm run test:e2e`, whose `webServer` runs `npm run build && npm run start`) are all
  blocked until this is resolved. `next dev` is unaffected because it compiles routes on demand and
  never touches `_zip_review`. Do not "fix" this as part of environment setup — it is application
  code owned by the repo.

### Infra scripts
- The `infra:*` scripts and `scripts/infra/*` target real Cloudflare/GitHub provisioning and require
  Cloudflare credentials. They are not needed for local development.
