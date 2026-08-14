#!/usr/bin/env bash
# LiveTrack — Cloud Agent install script.
# Idempotent: safe to run repeatedly and against cached/partial state.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies (npm ci)"
npm ci

echo "==> Installing Playwright Chromium (for e2e tests)"
npx playwright install --with-deps chromium

# Local dev secrets. AUTH_SECRET is a dev-only value generated here so the
# app can sign JWTs / WS tickets. Real deployments use `wrangler secret put`.
if [ ! -f .dev.vars ]; then
  echo "==> Creating .dev.vars with a generated AUTH_SECRET"
  cp .dev.vars.example .dev.vars
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .dev.vars
fi
if [ ! -f .env.local ]; then
  echo "==> Creating .env.local (reusing the .dev.vars AUTH_SECRET)"
  cp .env.example .env.local
  SECRET="$(grep '^AUTH_SECRET=' .dev.vars | cut -d= -f2-)"
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.local
fi

echo "==> Applying local D1 migrations"
npm run db:migrate:local

echo "==> Seeding roles & permissions"
npm run db:seed:local

echo "==> Ensuring a demo super admin (admin@example.com / ChangeMe123!)"
node scripts/create-admin.mjs --email admin@example.com --password 'ChangeMe123!' --name 'Demo Admin' || true

echo "==> Install complete"
