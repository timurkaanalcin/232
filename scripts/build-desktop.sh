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

build_win() {
  if npx electron-builder --win nsis zip --x64; then
    return 0
  fi
  echo "electron-builder Windows NSIS failed; packing portable zip" >&2
  npx electron-packager . CanliSite --platform=win32 --arch=x64 --out=out --overwrite --icon=icons/icon.ico
  (cd out && zip -r ../dist/canlisite_windows_portable.zip CanliSite-win32-x64)
}

build_mac() {
  if npx electron-builder --mac zip --x64 --arm64; then
    return 0
  fi
  echo "electron-builder macOS failed (expected on Linux); packing unsigned darwin .app zip" >&2
  npx electron-packager . CanliSite --platform=darwin --arch=x64 --out=out --overwrite --icon=icons/icon.png || true
  npx electron-packager . CanliSite --platform=darwin --arch=arm64 --out=out --overwrite --icon=icons/icon.png || true
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
