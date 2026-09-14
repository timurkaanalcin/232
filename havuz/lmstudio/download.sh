#!/usr/bin/env bash
# M3 Max 36 GB — zorunlu havuz. Mac'te, LM Studio bir kez açılmışken çalıştırın.
# Quant menüsü açılırsa: MLX 4-bit (27B/24B), 9B için MLX 8-bit. Aynı modelden ikinci quant almayın.
set -euo pipefail

need() { command -v "$1" >/dev/null || { echo "Eksik: $1 (LM Studio CLI: lms)"; exit 1; }; }
need lms

echo "==> Bellekten boşalt"
lms unload --all || true

get() {
  echo ""
  echo "==> lms get $*"
  lms get "$@"
}

# 1) Özgün taban — karşılaştırmanın referansı
get lmstudio-community/Qwen3.8-27B-MLX-4bit || get qwen/qwen3.8-27b --mlx

# 2) Claude yaklaşımı — ilk deneme (v2; v1 yasak)
get barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit || get barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF

# 3) Reasoning + uygulama geliştirme
get Jackrong/Qwopus3.6-27B-Fusion-GGUF

# 4) Türkçe sohbet / çok dilli reasoning
get lmstudio-community/Magistral-Small-2509-MLX-4bit || get mistralai/magistral-small-2509 --mlx

# 5) Hızlı günlük
get qwen/qwen3.5-9b --mlx

# 6) Embedding
get nomic-embed-text-v1.5 || get text-embedding-nomic-embed-text-v1.5

echo ""
echo "Bitti. Liste:"
lms ls
echo ""
echo "Sunucu: $(dirname "$0")/havuz-lms.sh start"
echo "Rol:    $(dirname "$0")/havuz-lms.sh claude|baseline|fusion|turkish|fast"
