#!/usr/bin/env bash
# Yasak ve şişman kopyaları işaretler. Silme: HAVUZ_LMS_DELETE=1
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
command -v lms >/dev/null || { echo "lms yok"; exit 1; }

KEEP_RE='Qwen3.8-27B-MLX-4bit|Qwen3.8-27B-Opus-Distill-v2|Qwopus3.6-27B-Fusion|Magistral-Small-2509|qwen3.5-9b|nomic-embed|Qwopus3.6-27B-v2|Claude-Opus-Reasoning-Distill-v2|Ministral-3-14B|phi-4-reasoning|Ornith-1.0-35B|nemotron-3-nano|gpt-oss-20b|qwen3-coder-30b|bge-m3|whisper'
BAN_RE='rico03|70[Bb]|72[Bb]|80[Bb]|120[Bb]|122[Bb]|397[Bb]|480[Bb]|gpt-oss-120|Opus-Distill-GGUF|Opus-Distill$|Qwen3.8-27B-Opus-Distill-MLX|Claude-Opus-Reasoning-Distilled[^-]|MLX-8bit'

echo "==> Kurulu modeller"
lms ls || true
echo ""
echo "Sakla (katalog seti): $KEEP_RE"
echo "Aday sil (v1, rico03, 70B+, 8-bit 27B, 120B): $BAN_RE"
echo ""
echo "Elle: LM Studio → My Models → Delete"
echo "veya: ~/.lmstudio/models/"
echo ""

if [[ "${HAVUZ_LMS_DELETE:-}" == "1" ]]; then
  echo "HAVUZ_LMS_DELETE=1 — lms rm dene (anahtarları siz onaylayın)."
  lms rm --help 2>/dev/null || lms remove --help 2>/dev/null || true
  echo "Otomatik silme yok; yasak klasörü Finder/lms rm ile kaldırın."
  echo "Yasak id’ler:"
  python3 "$DIR/catalog.py" banned
else
  echo "Silme kapalı. Onay: HAVUZ_LMS_DELETE=1 $0"
  echo "Yasak katalog id’leri:"
  python3 "$DIR/catalog.py" banned || true
fi
