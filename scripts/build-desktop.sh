#!/usr/bin/env bash
# Linux-friendly desktop packaging. Prefers electron-builder; falls back to electron-packager.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/desktop"
if [ ! -d node_modules ]; then
  npm ci --no-fund --no-audit || npm install --no-fund --no-audit
fi

export CSC_IDENTITY_AUTO_DISCOVERY=false
mkdir -p dist out

IGNORE_PACKAGER=(
  --ignore='^/dist($|/)'
  --ignore='^/out($|/)'
  --ignore='^/node_modules($|/)'
)

zip_win_unpacked() {
  if [ -d dist/win-unpacked ]; then
    rm -f dist/canlisite_windows_portable.zip
    (cd dist/win-unpacked && zip -r -q ../canlisite_windows_portable.zip .)
    echo "wrote dist/canlisite_windows_portable.zip from win-unpacked"
  fi
}

build_win() {
  set +e
  npx electron-builder --win nsis zip --x64
  local eb=$?
  set -e
  zip_win_unpacked
  if [ -f dist/canlisite_windows_setup.exe ] && [ "$(stat -c%s dist/canlisite_windows_setup.exe)" -gt 1000000 ]; then
    return 0
  fi
  if [ -f dist/canlisite_windows_portable.zip ] && [ "$(stat -c%s dist/canlisite_windows_portable.zip)" -gt 1000000 ]; then
    echo "Windows portable zip is ready; skipping packager fallback" >&2
    return 0
  fi
  echo "NSIS installer incomplete or missing wine; keeping portable zip and packing fallback exe folder" >&2
  npx electron-packager . CanliSite --platform=win32 --arch=x64 --out=out --overwrite --icon=icons/icon.ico "${IGNORE_PACKAGER[@]}"
  if [ ! -f dist/canlisite_windows_portable.zip ] && [ -d out/CanliSite-win32-x64 ]; then
    (cd out && zip -r -q ../dist/canlisite_windows_portable.zip CanliSite-win32-x64)
  fi
}

build_mac() {
  if npx electron-builder --mac zip --x64 --arm64; then
    return 0
  fi
  echo "electron-builder macOS failed (expected on Linux); packing unsigned darwin .app zip" >&2
  npx electron-packager . CanliSite --platform=darwin --arch=x64 --out=out --overwrite --icon=icons/icon.png "${IGNORE_PACKAGER[@]}" || true
  npx electron-packager . CanliSite --platform=darwin --arch=arm64 --out=out --overwrite --icon=icons/icon.png "${IGNORE_PACKAGER[@]}" || true
  if [ -d out/CanliSite-darwin-arm64 ]; then
    (cd out && zip -ry ../dist/canlisite_macos_arm64.zip CanliSite-darwin-arm64)
  fi
  if [ -d out/CanliSite-darwin-x64 ]; then
    (cd out && zip -ry ../dist/canlisite_macos_x64.zip CanliSite-darwin-x64)
  fi
}

case "${1:-all}" in
  win) build_win ;;
  mac) build_mac ;;
  all) build_win; build_mac ;;
  *) echo "usage: $0 [win|mac|all]"; exit 1 ;;
esac
