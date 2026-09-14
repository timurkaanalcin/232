#!/usr/bin/env bash
# Yerel Havuz otomasyonu: sunucu, rol yükleme, karşılaştırma.
#   ./havuz-lms.sh start|stop|status|list
#   ./havuz-lms.sh claude|baseline|fusion|turkish|fast|...
#   ./havuz-lms.sh load <id>
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CATALOG_PY="$DIR/catalog.py"
command -v lms >/dev/null || { echo "lms yok — LM Studio'yu bir kez açın"; exit 1; }
command -v python3 >/dev/null || { echo "python3 gerekli"; exit 1; }

CTX_DEFAULT="$(python3 -c "import json,pathlib; print(json.loads(pathlib.Path('$DIR/../src/lib/local-studio.json').read_text())['defaults']['ctx'])")"
CTX="${HAVUZ_CTX:-$CTX_DEFAULT}"
GPU="${HAVUZ_GPU:-max}"

json_field() {
  python3 "$CATALOG_PY" field "$1" "$2"
}

resolve_from_ls() {
  local needle="$1"
  if ! lms ls --json >/tmp/havuz-lms-ls.json 2>/dev/null; then
    return 1
  fi
  python3 - "$needle" <<'PY'
import json, sys
needle = sys.argv[1].lower()
try:
    data = json.load(open("/tmp/havuz-lms-ls.json"))
except Exception:
    sys.exit(1)
rows = data if isinstance(data, list) else data.get("models") or data.get("data") or []
for row in rows:
    if isinstance(row, str):
        key, path = row, row
    else:
        key = str(row.get("key") or row.get("modelKey") or row.get("id") or "")
        path = str(row.get("path") or row.get("name") or key)
    blob = f"{key} {path}".lower()
    if needle.lower() in blob:
        print(key or path)
        sys.exit(0)
sys.exit(1)
PY
}

load_match() {
  local id="$1"
  local ctx gpu identifier
  ctx="$(json_field "$id" ctx)"
  [[ -z "$ctx" || "$ctx" == "0" ]] && ctx="$CTX"
  gpu="$GPU"
  identifier="$(json_field "$id" identifier)"

  lms unload --all || true
  echo "==> yükle ${id}  ctx=${ctx} gpu=${gpu} id=${identifier}"

  local needles
  needles="$(python3 "$CATALOG_PY" needles "$id")"
  local n key
  while IFS= read -r n; do
    [[ -z "$n" ]] && continue
    key="$(resolve_from_ls "$n" || true)"
    if [[ -n "${key:-}" ]]; then
      echo "Eşleşen anahtar: $key"
      if lms load "$key" --gpu "$gpu" --context-length "$ctx" ${identifier:+--identifier "$identifier"}; then
        lms ps || true
        return 0
      fi
    fi
    if lms load "$n" --gpu "$gpu" --context-length "$ctx" ${identifier:+--identifier "$identifier"}; then
      lms ps || true
      return 0
    fi
  done <<< "$needles"

  echo "Otomatik yükleme eşleşmedi. LM Studio → My Models: ${id}"
  echo "Needles:"
  echo "$needles"
  lms ls
  exit 1
}

usage() {
  echo "Kullanım: $0 start|stop|status|list|compare|load <id>"
  echo "Roller:"
  python3 "$CATALOG_PY" ids all | sed 's/^/  /'
}

cmd="${1:-start}"
case "$cmd" in
  start)
    lms server start --port 1234 --cors || lms server start --cors
    echo "API: http://127.0.0.1:1234/v1  (Havuz Ayarlar → LM Studio kullan)"
    echo "CORS şart. Ağda 0.0.0.0 açmayın — tarayıcı sayfaları localhost’u çağırabilir."
    ;;
  stop)
    lms unload --all || true
    lms server stop || true
    ;;
  status)
    lms server status || true
    lms ps || true
    ;;
  list)
    python3 "$CATALOG_PY" table all
    echo ""
    lms ls || true
    ;;
  compare)
    exec "$DIR/compare.sh" "${@:2}"
    ;;
  load)
    [[ -n "${2:-}" ]] || { usage; exit 1; }
    load_match "$2"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    if python3 "$CATALOG_PY" json "$cmd" >/dev/null 2>&1; then
      banned="$(json_field "$cmd" banned)"
      if [[ "$banned" == "True" || "$banned" == "true" ]]; then
        echo "Yasak model: $cmd"
        exit 1
      fi
      load_match "$cmd"
    else
      usage
      exit 1
    fi
    ;;
esac
