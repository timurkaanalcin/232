#!/usr/bin/env bash
# Cloud Agent install script for LiveTrack.
# Idempotent: safe to run repeatedly and against cached/snapshotted state.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies (npm ci)"
npm ci

# Local dev secrets (git-ignored). Created from the checked-in examples.
# AUTH_SECRET is generated once and preserved on later runs so sessions stay valid.
[[ -f .dev.vars ]] || cp .dev.vars.example .dev.vars
[[ -f .env.local ]] || cp .env.example .env.local
if grep -qE '^AUTH_SECRET=$' .dev.vars .env.local 2>/dev/null; then
  echo "==> Generating AUTH_SECRET"
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .dev.vars .env.local
fi

# Local D1 (SQLite) database used by `next dev`/`wrangler dev`.
# Both commands are idempotent: migrations track applied state and the seed
# uses INSERT OR IGNORE.
echo "==> Applying local D1 migrations"
npm run db:migrate:local
echo "==> Seeding roles & permissions"
npm run db:seed:local

# Seed a demo super-admin (idempotent upsert on email) so the app is usable
# immediately. Change/remove for your own use.
echo "==> Ensuring demo super-admin (admin@example.com)"
node scripts/create-admin.mjs --email admin@example.com --password 'ChangeMe123!' --name 'Demo Admin'

echo "==> Install complete"
