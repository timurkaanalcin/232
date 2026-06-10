# Production Deployment Guide

LiveTrack deploys to **Cloudflare Workers** using the [OpenNext](https://opennext.js.org/cloudflare) adapter, with **D1** for storage and **Durable Objects** for realtime. Everything fits within Cloudflare's free tier.

## 1. One-time Cloudflare setup

```bash
npx wrangler login
```

Create the production database and apply the schema:

```bash
npx wrangler d1 create livetrack-db
# paste the database_id into wrangler.jsonc
npm run db:migrate:remote
npm run db:seed:remote
```

## 2. Configure production secrets

Never commit secrets. Set them with Wrangler:

```bash
npx wrangler secret put AUTH_SECRET           # openssl rand -base64 32
npx wrangler secret put AUTH_URL              # e.g. https://control.org.tr
npx wrangler secret put GOOGLE_CLIENT_ID      # optional
npx wrangler secret put GOOGLE_CLIENT_SECRET  # optional
npx wrangler secret put RESEND_API_KEY        # optional (password reset email)
npx wrangler secret put EMAIL_FROM            # optional
```

## 3. Deploy

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` then `wrangler deploy`, publishing the Worker, its assets, the D1 binding and both Durable Objects (`LocationHub`, `RateLimiterDO`).

Create the first super admin against the remote DB:

```bash
node scripts/create-admin.mjs --email you@example.com --password 'StrongPassword123!' --remote
```

## 4. Continuous deployment (fully automatic)

After a one-time secret setup, **every push to `main`** runs test → migrate → deploy → health check via `.github/workflows/deploy.yml`.

For the full secret list, bootstrap script, and troubleshooting see **[INFRASTRUCTURE.md](./INFRASTRUCTURE.md)**.

Minimum GitHub secrets:

- `CLOUDFLARE_API_TOKEN` — *Workers Scripts: Edit*, *D1: Edit*, *Workers Durable Objects: Edit*
- `CLOUDFLARE_ACCOUNT_ID`
- `AUTH_SECRET`, `AUTH_URL`

One-command local bootstrap (optional):

```bash
cp .env.infra.example .env.infra   # fill tokens
npm run infra:bootstrap
```

Or use Actions → **Infrastructure Bootstrap** without pushing from your machine.

## 5. Custom domain (e.g. `control.org.tr`)

You do **not** need traditional/shared hosting — the app runs on Cloudflare's edge. Point your domain at Cloudflare instead:

### Option A — Move the domain to Cloudflare (recommended, free auto-SSL)

1. In the Cloudflare dashboard: **Add a site** → enter `control.org.tr`.
2. Cloudflare shows two **nameservers**. Log in to your registrar (e.g. Natro) and replace the domain's nameservers with the Cloudflare ones. (Keep the registrar as-is; you're only changing nameservers.)
3. Wait for propagation (minutes to a few hours). Cloudflare then manages DNS and issues a **free Universal SSL certificate automatically** — no manual certificate purchase needed.
4. In **Workers & Pages → your Worker → Settings → Domains & Routes**, add the custom domain `control.org.tr` (and `www` if desired). Cloudflare provisions the route and TLS.
5. Set `AUTH_URL` to `https://control.org.tr` and update Google OAuth redirect URIs.

### Option B — Keep DNS at your registrar

If you must keep DNS at the registrar, use a **CNAME** record pointing your hostname to the Worker's `*.workers.dev` route, and manage TLS at the registrar. Option A is strongly preferred because Cloudflare handles SSL and routing natively.

### Subdomains

With the domain on Cloudflare (Option A), subdomains are trivial: add a custom domain like `app.control.org.tr` or a wildcard route to the same Worker, and TLS is issued automatically. This makes the platform "subdomain-ready" out of the box.

> SSL note: Cloudflare Universal SSL is free and automatic once the domain uses Cloudflare nameservers. Set **SSL/TLS mode** to *Full (strict)*. HSTS is already sent by the app.

## 6. Post-deploy verification

```bash
curl https://control.org.tr/api/health   # {"status":"healthy", ...}
```

- Register / sign in.
- Start a sharing session → confirm the live map updates.
- Sign in as admin → `/admin/map` shows the active session in realtime.
- `/admin/audit` shows login + session events.

## Scaling & limits (free tier)

| Resource | Free tier | Notes |
|----------|-----------|-------|
| Workers requests | 100k/day | Each API call + asset |
| D1 | 5 GB, 5M rows read/day | Location points dominate — tune `PERSIST_INTERVAL_MS` |
| Durable Objects | Included | Hibernation keeps idle WS connections free |

To reduce D1 writes, increase `REALTIME.PERSIST_INTERVAL_MS` in `src/lib/constants.ts`. Realtime broadcasts are independent of persistence.

## Rollback

```bash
npx wrangler deployments list
npx wrangler rollback [deployment-id]
```
