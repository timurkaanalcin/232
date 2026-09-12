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
npx wrangler secret put AUTH_URL              # https://googlefinance.login.org.tr
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

## 5. Natro üzerinden `googlefinance.login.org.tr`

Uygulama paylaşımlı hosting istemez; Cloudflare Worker üzerinde çalışır. Natro yalnızca **alan adı kaydı ve nameserver** içindir.

Canlı yedek adres (şimdi çalışıyor): https://borsahatti.timurkaanalcin.workers.dev

Kanonik adres: `https://googlefinance.login.org.tr`

### Natro adımları

1. [Natro müşteri paneli](https://www.natro.com/) → **Alan Adı Yönetimi**.
2. `login.org.tr` henüz yoksa satın alın / transfer edin (`.org.tr` için TRABIS kuruluş belgesi isteyebilir).
3. Cloudflare Dashboard → **Add a site** → `login.org.tr`. Cloudflare iki nameserver verir (ör. `xxx.ns.cloudflare.com`).
4. Natro → ilgili alan adı → **Nameserver Değiştir** → Cloudflare NS1 / NS2 yapıştır → kaydet. Registrar Natro kalır; sadece NS değişir.
5. NS yayıldıktan sonra (dakikalar–saatler) yerel makinede:

```bash
npx wrangler login
node scripts/infra/attach-natro-domain.mjs
```

Bu komut Worker'a `googlefinance.login.org.tr` custom domain ekler, ücretsiz SSL keser ve `AUTH_URL` secret'ını günceller. Cloudflare, `googlefinance` için DNS kaydını kendisi yazar — Natro'da ayrıca CNAME açmanıza gerek yoktur.

### Nameserver'ı Natro'da bırakmak (önerilmez)

Natro DNS'te şu CNAME tek başına HTTPS vermez (sertifika `*.workers.dev` içindir):

| Tür | Ad | Değer |
|-----|----|--------|
| CNAME | `googlefinance` | `borsahatti.timurkaanalcin.workers.dev` |

SSL için yine Cloudflare custom domain + zone gerekir. Bu yüzden nameserver'ı Cloudflare'e almak doğru yoldur.

> SSL: Cloudflare Universal SSL ücretsizdir. **SSL/TLS** modunu *Full (strict)* yapın. HSTS uygulama zaten gönderir.

## 6. Post-deploy verification

```bash
curl https://googlefinance.login.org.tr/api/health
# veya
curl https://borsahatti.timurkaanalcin.workers.dev/api/health
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
