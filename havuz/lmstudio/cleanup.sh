#!/usr/bin/env bash
# Tehlikeli modelleri ve gereksiz kopyaları işaretler / siler.
# Varsayılan: sadece listele. Gerçek silme: HAVUZ_LMS_DELETE=1
set -euo pipefail
command -v lms >/dev/null || { echo "lms yok"; exit 1; }

KEEP_RE='Qwen3.8-27B-MLX-4bit|Qwen3.8-27B-Opus-Distill-v2|Qwopus3.6-27B-Fusion|Magistral-Small-2509|qwen3.5-9b|nomic-embed'
BAN_RE='Opus-Distill[^-]|Opus-Distill$|rico03|70[Bb]|72[Bb]|480[Bb]|122[Bb]|Claude-Opus-Reasoning-Distilled'

echo "==> Kurulu modeller"
lms ls || true
echo ""
echo "Sakla (zorunlu set ile eşleşen): $KEEP_RE"
echo "Aday sil (v1, rico03, 70B+): $BAN_RE"
echo ""
echo "Elle sil: LM Studio → My Models → Delete"
echo "veya: ~/.lmstudio/models/ altında klasör"
echo ""
if [[ "${HAVUZ_LMS_DELETE:-}" == "1" ]]; then
  echo "HAVUZ_LMS_DELETE=1 set; lms remove yoksa Finder'dan silin."
  lms remove --help 2>/dev/null || true
else
  echo "Silme kapalı. Onay için: HAVUZ_LMS_DELETE=1 $0"
fi
