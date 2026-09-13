#!/usr/bin/env bash
# Build unsigned debug APK for CanlıSite (Capacitor + production HTTPS URL).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
if command -v javac >/dev/null; then
  export JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(which javac)")")")}"
fi
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

cd "$ROOT/native"
if [ ! -d node_modules ]; then
  if [ -f package-lock.json ]; then
    npm ci --no-fund --no-audit
  else
    npm install --no-fund --no-audit
  fi
fi
if [ ! -d android ]; then
  npx cap add android
fi
npx cap sync android

echo "sdk.dir=${ANDROID_HOME}" > android/local.properties

python3 - <<'PY'
from pathlib import Path
manifest = Path("android/app/src/main/AndroidManifest.xml")
text = manifest.read_text()
needed = [
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
]
insert = []
for perm in needed:
    token = f'android:name="{perm}"'
    if token not in text:
        insert.append(f'    <uses-permission android:name="{perm}" />')
if insert:
    close = text.find(">")
    text = text[: close + 1] + "\n" + "\n".join(insert) + text[close + 1 :]
    manifest.write_text(text)
    print("patched AndroidManifest.xml with location permissions")
else:
    print("AndroidManifest already has location permissions")
PY

# Launcher icons
python3 - <<'PY'
from pathlib import Path
import shutil
src = Path("icons/icon.png")
if not src.exists():
    raise SystemExit(0)
res = Path("android/app/src/main/res")
mapping = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
# copy 192 as-is into xxxhdpi; others use same file (Android scales)
for folder in mapping:
    dest_dir = res / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"):
        shutil.copyfile(src, dest_dir / name)
print("copied launcher icons")
PY

cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
find app/build/outputs/apk -name '*.apk' -print
