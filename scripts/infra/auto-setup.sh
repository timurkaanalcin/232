#!/usr/bin/env bash
# LiveTrack — tek komutla tam kurulum (OAuth + push + Cloudflare deploy)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$*"; exit 1; }

bold "LiveTrack otomatik kurulum"
echo ""

# --- .env.infra ---
if [[ ! -f .env.infra ]]; then
  cp .env.infra.example .env.infra
  SECRET=$(openssl rand -base64 32)
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.infra
  else
    sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=${SECRET}|" .env.infra
  fi
  ok ".env.infra oluşturuldu (AUTH_SECRET üretildi)"
else
  ok ".env.infra mevcut"
fi

# --- GitHub ---
if ! gh auth status &>/dev/null; then
  bold "GitHub girişi — tarayıcıda onaylayın"
  gh auth login --hostname github.com --git-protocol https --web
fi
ok "GitHub oturumu hazır"

# --- Cloudflare ---
if ! npx wrangler whoami &>/dev/null; then
  bold "Cloudflare girişi — tarayıcıda onaylayın"
  npx wrangler login
fi
ok "Cloudflare oturumu hazır"

# CLOUDFLARE_ACCOUNT_ID yoksa wrangler'dan al
if ! grep -q '^CLOUDFLARE_ACCOUNT_ID=.\+' .env.infra 2>/dev/null; then
  ACCOUNT_ID=$(npx wrangler whoami 2>/dev/null | grep -oE 'Account ID: [a-f0-9]+' | awk '{print $3}' || true)
  if [[ -n "${ACCOUNT_ID:-}" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^CLOUDFLARE_ACCOUNT_ID=.*|CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}|" .env.infra
    else
      sed -i "s|^CLOUDFLARE_ACCOUNT_ID=.*|CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}|" .env.infra
    fi
    ok "CLOUDFLARE_ACCOUNT_ID .env.infra'ya yazıldı"
  else
    warn "CLOUDFLARE_ACCOUNT_ID bulunamadı — Cloudflare Dashboard'dan .env.infra'ya ekleyin"
  fi
fi

# API token yoksa kullanıcıya hatırlat (OAuth wrangler login deploy için yeterli olabilir)
if ! grep -q '^CLOUDFLARE_API_TOKEN=.\+' .env.infra 2>/dev/null; then
  warn "CLOUDFLARE_API_TOKEN boş — wrangler OAuth ile devam ediliyor (CI için GitHub secret gerekir)"
fi

bold "GitHub'a push"
git push -u origin main
ok "Push tamam"

bold "Cloudflare provision + migrate + deploy"
export $(grep -v '^#' .env.infra | grep -v '^$' | xargs) 2>/dev/null || true
node scripts/infra/provision-cloudflare.mjs || warn "D1 provision atlandı veya zaten var"

if grep -q '^CLOUDFLARE_API_TOKEN=.\+' .env.infra 2>/dev/null; then
  node scripts/infra/sync-secrets.mjs --remote || warn "Secret sync kısmen başarısız"
else
  warn "Secret sync atlandı — wrangler secret put ile manuel veya API token ekleyin"
  npx wrangler secret put AUTH_SECRET <<< "${AUTH_SECRET:-}" 2>/dev/null || true
  npx wrangler secret put AUTH_URL <<< "${AUTH_URL:-https://control.org.tr}" 2>/dev/null || true
fi

npm run db:migrate:remote
npm run deploy
ok "Deploy tamam"

bold "Kurulum bitti"
echo "  Site: ${AUTH_URL:-https://control.org.tr}"
echo "  Admin: node scripts/create-admin.mjs --email YOU@example.com --password '...' --remote"
echo "  CI/CD: GitHub → Settings → Secrets → CLOUDFLARE_* + AUTH_* ekleyin"
