#!/usr/bin/env bash
# Build LocalForge.app and a macOS installer .pkg (must run on macOS).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
APP="$DIST/LocalForge.app"
MACOS="$APP/Contents/MacOS"
RES="$APP/Contents/Resources"
PKG="$DIST/LocalForge-1.0.0.pkg"
IDENT="com.timurkaanalcin.localforge"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script compiles a Mac app. Run it on a Mac with Xcode Command Line Tools:" >&2
  echo "  cd macos/LocalForge && ./scripts/build-pkg.sh" >&2
  exit 1
fi

command -v swiftc >/dev/null || {
  echo "swiftc not found. Install Xcode Command Line Tools: xcode-select --install" >&2
  exit 1
}

SDK="$(xcrun --sdk macosx --show-sdk-path)"
ARCH="$(uname -m)"
TARGET="${ARCH}-apple-macos14"

rm -rf "$DIST"
mkdir -p "$MACOS" "$RES"

swiftc -parse-as-library \
  -sdk "$SDK" \
  -target "$TARGET" \
  -framework SwiftUI \
  -framework AppKit \
  -o "$MACOS/LocalForge" \
  "$ROOT/Sources/LocalForgeApp.swift" \
  "$ROOT/Sources/WorkspaceModel.swift" \
  "$ROOT/Sources/RootView.swift"

cp "$ROOT/Resources/Info.plist" "$APP/Contents/Info.plist"
chmod +x "$MACOS/LocalForge"

# Stage payload for pkgbuild: /Applications/LocalForge.app
STAGE="$DIST/payload"
mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/LocalForge.app"

pkgbuild \
  --root "$STAGE" \
  --identifier "$IDENT" \
  --version "1.0.0" \
  --install-location "/Applications" \
  "$PKG"

echo
echo "Built:"
echo "  $APP"
echo "  $PKG"
echo "Install with: sudo installer -pkg \"$PKG\" -target /"
