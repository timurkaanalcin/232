#!/usr/bin/env bash
# Build llvadLOCAL.app and a macOS installer .pkg.
# Must be run on macOS with Xcode Command Line Tools. Will refuse on Linux.
# This environment cannot produce a real signed macOS pkg — do not fake one.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
APP="$DIST/llvadLOCAL.app"
MACOS="$APP/Contents/MacOS"
RES="$APP/Contents/Resources"
VERSION="1.5.0"
PKG="$DIST/llvadLOCAL-${VERSION}.pkg"
IDENT="com.timurkaanalcin.llvadlocal"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "llvadLOCAL .pkg can only be built on macOS (this host is $(uname -s))." >&2
  echo "On a Mac with Xcode Command Line Tools:" >&2
  echo "  cd macos/llvadLOCAL && ./scripts/build-pkg.sh" >&2
  echo "Output: dist/llvadLOCAL.app and dist/llvadLOCAL-${VERSION}.pkg" >&2
  echo "An earlier LocalForge-1.4.0.pkg (pre-rename) is not this product's installer." >&2
  exit 1
fi

command -v swiftc >/dev/null || {
  echo "swiftc not found. Install Xcode Command Line Tools: xcode-select --install" >&2
  exit 1
}

command -v pkgbuild >/dev/null || {
  echo "pkgbuild not found. Install Xcode Command Line Tools: xcode-select --install" >&2
  exit 1
}

SDK="$(xcrun --sdk macosx --show-sdk-path)"
ARCH="$(uname -m)"
TARGET="${ARCH}-apple-macos14"

shopt -s nullglob
SOURCES=( "$ROOT"/Sources/*.swift )
if [[ ${#SOURCES[@]} -eq 0 ]]; then
  echo "No Swift sources in $ROOT/Sources" >&2
  exit 1
fi

rm -rf "$DIST"
mkdir -p "$MACOS" "$RES"

swiftc -parse-as-library \
  -sdk "$SDK" \
  -target "$TARGET" \
  -framework SwiftUI \
  -framework AppKit \
  -o "$MACOS/llvadLOCAL" \
  "${SOURCES[@]}"

cp "$ROOT/Resources/Info.plist" "$APP/Contents/Info.plist"
chmod +x "$MACOS/llvadLOCAL"

if [[ ! -x "$MACOS/llvadLOCAL" ]]; then
  echo "Failed to produce llvadLOCAL executable" >&2
  exit 1
fi

STAGE="$DIST/payload"
mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/llvadLOCAL.app"

pkgbuild \
  --root "$STAGE" \
  --identifier "$IDENT" \
  --version "$VERSION" \
  --install-location "/Applications" \
  "$PKG"

echo
echo "Built:"
echo "  $APP"
echo "  $PKG"
echo "Install: double-click the .pkg, or:"
echo "  sudo installer -pkg \"$PKG\" -target /"
echo
echo "This installer is unsigned. Gatekeeper may ask you to allow it in System Settings → Privacy & Security."
