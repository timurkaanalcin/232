#!/usr/bin/env bash
# Login’de LM Studio API (yalnızca macOS).
#   ./install-launchd.sh
#   ./install-launchd.sh uninstall
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.havuz.lms"
PLIST_SRC="$DIR/com.havuz.lms.plist"
DEST="${HOME}/Library/LaunchAgents/${LABEL}.plist"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "LaunchAgent yalnızca macOS. Bu makinede atlandı."
  exit 0
fi

cmd="${1:-install}"
uid="$(id -u)"

uninstall() {
  launchctl bootout "gui/${uid}/${LABEL}" 2>/dev/null || launchctl unload "$DEST" 2>/dev/null || true
  rm -f "$DEST"
  echo "Kaldırıldı: $LABEL"
}

if [[ "$cmd" == "uninstall" ]]; then
  uninstall
  exit 0
fi

mkdir -p "$(dirname "$DEST")"
python3 - "$PLIST_SRC" "$DEST" "$DIR/havuz-lms.sh" <<'PY'
import pathlib, sys
src, dest, script = map(pathlib.Path, sys.argv[1:4])
text = src.read_text()
text = text.replace("/Users/REPLACE/232/havuz/lmstudio/havuz-lms.sh", str(script))
dest.write_text(text)
print(dest)
PY

uninstall || true
if launchctl bootstrap "gui/${uid}" "$DEST" 2>/dev/null; then
  echo "Yüklendi (bootstrap): $DEST"
else
  launchctl load "$DEST"
  echo "Yüklendi (load): $DEST"
fi
echo "Kontrol: launchctl print gui/${uid}/${LABEL} | head"
echo "API: ./havuz-lms.sh status"
