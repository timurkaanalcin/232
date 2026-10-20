#!/usr/bin/env bash
# LiveTrack — Cloud Agent environment bootstrap.
# Idempotent: safe to run repeatedly and against cached/snapshot state.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies (npm ci)"
npm ci

# Local dev secrets. Generated once; kept stable across reruns so sessions and
# the seeded admin login remain valid. Never committed (.dev.vars/.env.local are git-ignored).
if [[ ! -f .dev.vars || ! -f .env.local ]]; then
  echo "==> Creating local env files with a generated AUTH_SECRET"
  SECRET="$(openssl rand -base64 32)"
  [[ -f .dev.vars ]]  || { cp .dev.vars.example .dev.vars;   sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .dev.vars; }
  [[ -f .env.local ]] || { cp .env.example   .env.local;     sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.local; }
else
  echo "==> Local env files already present; leaving AUTH_SECRET untouched"
fi

echo "==> Applying local D1 migrations"
npm run db:migrate:local

echo "==> Seeding roles & permissions"
npm run db:seed:local

# Seed a demo super admin for local sign-in. Upsert => idempotent.
ADMIN_EMAIL="${LIVETRACK_ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${LIVETRACK_ADMIN_PASSWORD:-ChangeMe123!}"
echo "==> Ensuring demo super admin (${ADMIN_EMAIL})"
node scripts/create-admin.mjs --email "${ADMIN_EMAIL}" --password "${ADMIN_PASSWORD}" --name "Demo Admin"

echo ""
echo "Bootstrap complete."
echo "  Dev server:   npm run dev      (http://localhost:3000, hot reload, D1 bindings)"
echo "  Full stack:   npm run preview  (http://localhost:8787, real Durable Objects + realtime)"
echo "  Admin login:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}"
