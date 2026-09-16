#!/usr/bin/env bash
# Tek komut teslim: izinler, 1. dalga (veya argüman), sunucu, LaunchAgent.
#   ./install.sh
#   ./install.sh 2
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
WAVE="${1:-1}"
chmod +x "$DIR"/*.sh "$DIR"/catalog.py 2>/dev/null || true

echo "==> llvadAI LM Studio kurulum  dalga=${WAVE}"
echo "Bu script Mac’te çalışır. Cloud agent lms göremez."

if ! command -v lms >/dev/null; then
  echo "lms yok. LM Studio’yu açın, CLI’yi etkinleştirin, tekrar çalıştırın."
  echo "https://lmstudio.ai/docs/cli"
  exit 1
fi

"$DIR/download.sh" "$WAVE"
"$DIR/havuz-lms.sh" start
"$DIR/install-launchd.sh" || true
"$DIR/cleanup.sh"
"$DIR/havuz-lms.sh" status || true

echo ""
echo "Sıradaki:"
echo "  1) llvadAI Ayarlar → LM Studio kullan"
echo "  2) Claude adayı:  $DIR/havuz-lms.sh claude"
echo "  3) Referans:      $DIR/havuz-lms.sh baseline"
echo "  4) Aynı sorular:  $DIR/compare.sh"
echo "  5) Fusion / TR:   $DIR/havuz-lms.sh fusion | turkish"
echo ""
echo "Deneme sırası (kaynak incelemesi, ölçüm değil): barozp v2 → Fusion → Magistral, hepsi özgün Qwen3.8 ile."
