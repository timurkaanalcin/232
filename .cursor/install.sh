#!/usr/bin/env bash
# LiveTrack — Cloud Agent install script.
# Idempotent repository bootstrap: dependencies, local dev secrets, and a
# seeded local D1 database with a default super admin. Safe to re-run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies (npm ci)"
npm ci

# Local dev secrets (git-ignored). AUTH_SECRET is a locally generated signing
# key for development only — it is not a real/production credential. Only create
# the files if they are missing so re-runs do not rotate the key.
if [[ ! -f .dev.vars ]]; then
  echo "==> Generating .dev.vars"
  SECRET="$(openssl rand -base64 32)"
  cat > .dev.vars <<EOF
AUTH_SECRET=$SECRET
AUTH_URL=http://localhost:8787
AUTH_TRUST_HOST=true
EOF
fi

if [[ ! -f .env.local ]]; then
  echo "==> Generating .env.local"
  SECRET_ENV="$(grep '^AUTH_SECRET=' .dev.vars | cut -d= -f2-)"
  cat > .env.local <<EOF
AUTH_SECRET=$SECRET_ENV
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
EOF
fi

echo "==> Applying local D1 migrations"
npm run db:migrate:local

echo "==> Seeding roles & permissions"
npm run db:seed:local

echo "==> Ensuring default super admin (admin@livetrack.local)"
node scripts/create-admin.mjs \
  --email admin@livetrack.local \
  --password 'ChangeMe123!' \
  --name 'Super Admin'

echo "==> Install complete."
