#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/local/models" "$ROOT/local/llama"
curl -L --fail -o /tmp/llama-ubuntu-x64.tar.gz \
  "https://github.com/ggml-org/llama.cpp/releases/download/b10948/llama-b10948-bin-ubuntu-x64.tar.gz"
tar -xzf /tmp/llama-ubuntu-x64.tar.gz -C "$ROOT/local/llama"
curl -L --fail -C - -o "$ROOT/local/models/Dolphin3.0-Llama3.2-3B-Q4_K_M.gguf" \
  "https://huggingface.co/bartowski/Dolphin3.0-Llama3.2-3B-GGUF/resolve/main/Dolphin3.0-Llama3.2-3B-Q4_K_M.gguf"
echo "Ready. Run: npm run llama"
