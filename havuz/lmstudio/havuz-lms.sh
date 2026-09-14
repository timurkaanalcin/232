#!/usr/bin/env bash
# Yerel Havuz otomasyonu: sunucu + rol yükleme.
# Kullanım:
#   ./havuz-lms.sh start
#   ./havuz-lms.sh claude|baseline|fusion|turkish|fast
#   ./havuz-lms.sh stop
set -euo pipefail
command -v lms >/dev/null || { echo "lms yok — LM Studio'yu bir kez açın"; exit 1; }

CTX="${HAVUZ_CTX:-16384}"
GPU="${HAVUZ_GPU:-max}"

load_match() {
  local needle="$1"
  lms unload --all || true
  echo "==> yükle ~ ${needle}  ctx=${CTX} gpu=${GPU}"
  # lms load etkileşimli olabilir; tam anahtar varsa doğrudan dene.
  if ! lms load "$needle" --gpu "$GPU" --context-length "$CTX"; then
    echo "Otomatik yükleme eşleşmedi. LM Studio'da My Models'dan seçin: ${needle}"
    lms ls
    exit 1
  fi
}

cmd="${1:-start}"
case "$cmd" in
  start)
    lms server start --port 1234 --cors || lms server start --cors
    echo "API: http://127.0.0.1:1234/v1  (Havuz Ayarlar → LM Studio kullan)"
    ;;
  stop)
    lms unload --all || true
    lms server stop || true
    ;;
  claude)
    load_match "Qwen3.8-27B-Opus-Distill-v2"
    ;;
  baseline)
    load_match "Qwen3.8-27B-MLX-4bit"
    ;;
  fusion)
    load_match "Qwopus3.6-27B-Fusion"
    ;;
  turkish)
    load_match "Magistral-Small-2509"
    ;;
  fast)
    load_match "qwen3.5-9b"
    ;;
  status)
    lms server status || true
    lms ps || true
    ;;
  *)
    echo "Kullanım: $0 start|stop|status|claude|baseline|fusion|turkish|fast"
    exit 1
    ;;
esac
