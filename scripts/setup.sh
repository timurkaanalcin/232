#!/usr/bin/env bash
# LiveTrack — local bootstrap script
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
npm install

if [[ ! -f .dev.vars ]]; then
  echo "==> Creating .dev.vars from example"
  cp .dev.vars.example .dev.vars
  echo "    Fill AUTH_SECRET in .dev.vars: openssl rand -base64 32"
fi

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi

echo "==> Applying local D1 migrations"
npm run db:migrate:local || {
  echo "    If database_id is missing, run: npx wrangler d1 create livetrack-db"
  echo "    Then paste the id into wrangler.jsonc and re-run this script."
  exit 1
}

echo "==> Seeding roles & permissions"
npm run db:seed:local

echo ""
echo "Setup complete. Next steps:"
echo "  1. Set AUTH_SECRET in .dev.vars and .env.local"
echo "  2. node scripts/create-admin.mjs --email you@example.com --password 'ChangeMe123!'"
echo "  3. npm run preview    # full Cloudflare bindings at http://localhost:8787"
