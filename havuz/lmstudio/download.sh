#!/usr/bin/env bash
# M3 Max 36 GB — dalga dalga indirme.
# Kullanım: ./download.sh [1|2|3|extra|all|list]
# Quant menüsü açılırsa: 27B/24B için MLX 4-bit (GGUF ise Q4_K_M). 8-bit 27B alma.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CATALOG_PY="$DIR/catalog.py"
WAVE="${1:-1}"

if [[ "$WAVE" == "list" || "$WAVE" == "-h" || "$WAVE" == "--help" ]]; then
  python3 "$CATALOG_PY" table all
  echo ""
  echo "1. dalga: ./download.sh"
  echo "2. dalga: ./download.sh 2"
  echo "3. dalga (sıkı bellek): ./download.sh 3"
  echo "Ek modüller: ./download.sh extra"
  echo "1+2+3+extra: ./download.sh all"
  echo "Yasak: barozp v1, rico03, 70B+, gpt-oss-120b, MLX 8-bit 27B"
  exit 0
fi

need() { command -v "$1" >/dev/null || { echo "Eksik: $1 (LM Studio CLI: lms)"; exit 1; }; }
need lms
command -v python3 >/dev/null || { echo "python3 gerekli"; exit 1; }

echo "==> Bellekten boşalt (36 GB kuralı: tek sohbet modeli)"
lms unload --all || true

failed=0
ok=0

get_one() {
  local spec="$1"
  local flags="$2"
  echo ""
  echo "==> lms get ${spec} ${flags}"
  # shellcheck disable=SC2086
  if lms get ${flags} "$spec"; then
    return 0
  fi
  return 1
}

download_id() {
  local id="$1"
  echo ""
  echo "---- ${id} ----"
  local any=0
  while IFS=$'\t' read -r spec flags; do
    [[ -z "${spec:-}" ]] && continue
    if get_one "$spec" "${flags:-}"; then
      any=1
      ok=$((ok + 1))
      return 0
    fi
  done < <(python3 "$CATALOG_PY" gets "$id")
  echo "UYARI: ${id} indirilemedi (adaylar tükendi)."
  failed=$((failed + 1))
  return 1
}

ids="$(python3 "$CATALOG_PY" ids "$WAVE")"
if [[ -z "$ids" ]]; then
  echo "Dalga boş: $WAVE"
  exit 1
fi

echo "Dalga: $WAVE"
echo "$ids"

while IFS= read -r id; do
  [[ -z "$id" ]] && continue
  download_id "$id" || true
done <<< "$ids"

echo ""
echo "Bitti. başarılı≈${ok}  başarısız=${failed}"
echo "Liste:"
lms ls || true
echo ""
echo "Sunucu: $DIR/havuz-lms.sh start"
echo "Rol:    $DIR/havuz-lms.sh claude|baseline|fusion|turkish|fast"
echo "Yasakları işaretle: $DIR/cleanup.sh"
exit 0
