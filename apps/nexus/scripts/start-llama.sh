#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/local/llama/llama-b10948/llama-server"
export LD_LIBRARY_PATH="$ROOT/local/llama/llama-b10948:${LD_LIBRARY_PATH:-}"
MODEL="$ROOT/local/models/Dolphin3.0-Llama3.2-3B-Q4_K_M.gguf"
PORT="${NEXUS_LLM_PORT:-8088}"

if [[ ! -x "$BIN" ]]; then
  echo "llama-server missing. Extract the llama.cpp ubuntu-x64 archive into local/llama/" >&2
  exit 1
fi
if [[ ! -f "$MODEL" ]]; then
  echo "GGUF missing at $MODEL" >&2
  exit 1
fi

exec "$BIN" \
  -m "$MODEL" \
  --host 127.0.0.1 \
  --port "$PORT" \
  -c 4096 \
  -t "$(nproc)" \
  --alias dolphin-uncensored \
  -ngl 0
