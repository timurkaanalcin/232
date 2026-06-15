# ALS Yatırım Production Hosting

This project is prepared for the production domain:

```text
https://alsyatirim.login.org.tr
```

The app deploys as a Cloudflare Worker through OpenNext Cloudflare.

## What is already configured

- `wrangler.jsonc` Worker name: `als-yatirim`
- `wrangler.jsonc` custom domain route: `alsyatirim.login.org.tr`
- `AUTH_URL`: `https://alsyatirim.login.org.tr`
- `NEXT_PUBLIC_SITE_URL`: `https://alsyatirim.login.org.tr`
- Email sender examples use the ALS Yatırım domain.

## Required DNS / Cloudflare setup

The domain owner must complete one of these setups:

### Option A: `login.org.tr` zone is on Cloudflare

1. Add `login.org.tr` to the same Cloudflare account used by Wrangler.
2. Create a DNS record for:

```text
Name: alsyatirim
Type: CNAME
Target: als-yatirim.<account-subdomain>.workers.dev
Proxy: Proxied
```

3. Deploy the Worker:

```bash
npm run cf:build
npx wrangler deploy
```

Cloudflare will bind the `custom_domain` route from `wrangler.jsonc`.

### Option B: DNS is managed outside Cloudflare

1. Add the domain/custom hostname in Cloudflare Workers/Routes for the Worker.
2. Point `alsyatirim.login.org.tr` to the Cloudflare-provided hostname.
3. Ensure SSL is active for the hostname.

## Required production secrets

Never commit these values. Set them in Cloudflare:

```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put BROKER_API_KEY
```

If Google OAuth or email reset is used:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put RESEND_API_KEY
```

## Required production variables

Set non-secret variables either in Cloudflare dashboard or `wrangler.jsonc`:

```text
AUTH_URL=https://alsyatirim.login.org.tr
NEXT_PUBLIC_SITE_URL=https://alsyatirim.login.org.tr
BROKER_API_URL=<licensed broker API base URL>
BROKER_ACCOUNT_ID=<optional broker account id>
```

## Database migration

Apply all D1 migrations before using the production site:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

## Broker requirement

The trading terminal no longer creates fake/demo fills.

Real orders require:

```text
BROKER_API_URL
BROKER_API_KEY
BROKER_ACCOUNT_ID (if required by the broker)
```

Without these, order creation is rejected with a clear broker configuration error.

## Production deploy checklist

1. Confirm DNS for `alsyatirim.login.org.tr`.
2. Configure Cloudflare custom domain/route.
3. Set `AUTH_SECRET`.
4. Set broker API credentials.
5. Run D1 remote migrations.
6. Deploy:

```bash
npm run cf:build
npx wrangler deploy
```

7. Open:

```text
https://alsyatirim.login.org.tr
```
