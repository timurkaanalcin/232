#!/usr/bin/env bash
# Son adım: GitHub push + CI/CD tetikleme
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! gh auth status &>/dev/null; then
  echo "GitHub girişi — tarayıcıda kodu onaylayın:"
  gh auth login --hostname github.com --git-protocol https --web
fi

gh auth setup-git
git push -u origin main

echo ""
echo "✓ Push tamam. GitHub Actions otomatik çalışacak."
echo "  Repo → Settings → Secrets → şunları ekleyin (CI için):"
echo "    CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, AUTH_SECRET, AUTH_URL"
