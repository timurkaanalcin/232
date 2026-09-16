#!/usr/bin/env bash
# İsteğe bağlı: sohbet modelini boşaltıp gömme modelini yükler (RAG).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$DIR/havuz-lms.sh" load "${1:-embed}"
