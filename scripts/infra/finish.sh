#!/usr/bin/env bash
# Son adım: GitHub push (tarayıcı GEREKMEZ — token ile)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# .env.infra'dan GITHUB_TOKEN oku
if [[ -f .env.infra ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^GITHUB_TOKEN=' .env.infra | sed 's/^/export /')
  set +a
fi

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "==> GITHUB_TOKEN ile giriş..."
  echo "$GITHUB_TOKEN" | gh auth login --with-token
  gh auth setup-git
  git push -u origin main
  echo "✓ Push tamam."
  exit 0
fi

if gh auth status &>/dev/null; then
  gh auth setup-git
  git push -u origin main
  echo "✓ Push tamam."
  exit 0
fi

cat <<'EOF'

GitHub push için tarayıcı açılmıyorsa TOKEN yöntemi (2 dk):

1) https://github.com/settings/tokens/new
   - Note: livetrack-push
   - Expiration: 90 days
   - Scope: repo (tümünü işaretle)

2) Oluşan token'ı .env.infra dosyasına ekleyin:
   GITHUB_TOKEN=ghp_xxxxxxxx

3) Tekrar çalıştırın:
   npm run infra:finish

VEYA terminalde doğrudan (token'ı yapıştırın):
   echo "ghp_TOKEN_BURAYA" | gh auth login --with-token
   git push -u origin main

EOF
exit 1
