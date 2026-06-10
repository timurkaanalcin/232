# Infrastructure Automation

LiveTrack is designed to run **without manual deploy steps** after a one-time secret setup. Push to `main` → test → migrate → sync secrets → deploy → health check.

## Architecture

```mermaid
flowchart LR
  subgraph local [Local / Bootstrap]
    A[.env.infra] --> B[npm run infra:bootstrap]
    B --> C[Provision D1]
    B --> D[Sync secrets]
    B --> E[Deploy]
    B --> F[GitHub push]
  end
  subgraph github [GitHub Actions]
    G[push main] --> H[quality job]
    H --> I[provision + secrets + migrate]
    I --> J[wrangler deploy]
    J --> K[/api/health]
  end
  F --> G
```

## One-time setup (≈5 minutes)

### 1. Cloudflare API token

Cloudflare Dashboard → **My Profile → API Tokens → Create Token**

Permissions:

- Account — **D1: Edit**
- Account — **Workers Scripts: Edit**
- Account — **Workers Durable Objects: Edit**

Copy **Account ID** from the dashboard sidebar.

### 2. GitHub repository secrets

Repo → **Settings → Secrets and variables → Actions**

| Secret | Required | Purpose |
|--------|----------|---------|
| `CLOUDFLARE_API_TOKEN` | ✅ | CI deploy + D1 |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | CI deploy + D1 |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_URL` | ✅ | e.g. `https://control.org.tr` |
| `GOOGLE_CLIENT_ID` | ➖ | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ➖ | Google OAuth |
| `RESEND_API_KEY` | ➖ | Password reset email |
| `EMAIL_FROM` | ➖ | Sender address |
| `TELEGRAM_BOT_TOKEN` | ➖ | Admin alerts |
| `TELEGRAM_ADMIN_CHAT_ID` | ➖ | Admin alerts |
| `ADMIN_EMAIL` | ➖ | Bootstrap admin user |
| `ADMIN_PASSWORD` | ➖ | Bootstrap admin password |

Create **environment** `production` (optional) to protect deploy workflows.

### 3. Local bootstrap — fully automatic (recommended)

One command does everything (opens browser **once** for GitHub + Cloudflare OAuth if needed):

```bash
npm run infra:run
```

Uses `wrangler login` OAuth locally — **no API token required** for first deploy. Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets later for CI-only automation.

Manual token path (optional):

```bash
cp .env.infra.example .env.infra
# fill CLOUDFLARE_*, AUTH_*, GITHUB_TOKEN (repo scope PAT)
npm run infra:bootstrap
```

Flags:

- `--no-push` — skip GitHub push
- `--no-deploy` — only provision DB + secrets
- `--no-secrets` — skip Cloudflare secret sync

Individual steps:

```bash
npm run infra:provision   # D1 create + patch wrangler.jsonc
npm run infra:secrets     # wrangler secret put (remote)
npm run infra:push        # git push via GITHUB_TOKEN
```

### 4. GitHub Actions bootstrap (no local push)

If code is already on GitHub but Cloudflare is empty:

1. Add secrets from step 2.
2. Actions → **Infrastructure Bootstrap** → **Run workflow**.
3. Enable *Create super admin* if `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set.

## Day-to-day (fully automatic)

Every push to `main`:

1. Typecheck, lint, unit tests, Next.js build
2. Ensure D1 exists (idempotent)
3. Sync secrets from GitHub → Cloudflare Worker
4. Apply D1 migrations
5. `opennextjs-cloudflare build` + `wrangler deploy`
6. `GET {AUTH_URL}/api/health` smoke test

Pull requests run the same quality checks via `ci.yml` (no deploy).

## Custom domain

DNS stays manual once (nameservers → Cloudflare). After that, SSL and routing are automatic. See [DEPLOYMENT.md](./DEPLOYMENT.md) §5.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `database_id` placeholder in `wrangler.jsonc` | Run `npm run infra:provision` or Infrastructure Bootstrap workflow |
| Deploy fails: missing `AUTH_SECRET` | Add GitHub secret or `.env.infra` |
| Local push: `Device not configured` | Set `GITHUB_TOKEN` in `.env.infra` and `npm run infra:push` |
| Health check fails | Wait for DNS/SSL; confirm `AUTH_URL` matches live domain |
