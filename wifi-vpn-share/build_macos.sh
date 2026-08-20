#!/usr/bin/env bash
#
# build_macos.sh — Build a native macOS single-file binary AND a .pkg installer
# for wifi_vpn_share.  RUN THIS ON A MAC (macOS), not on Linux: PyInstaller and
# pkgbuild cannot cross-compile a macOS build from another OS.
#
# Output (in ./dist):
#   wifi-vpn-share                      -> single-file Mach-O executable
#   wifi-vpn-share-<version>.pkg        -> double-clickable macOS installer
#                                          (installs the binary to /usr/local/bin)
#
# Usage:
#   chmod +x build_macos.sh
#   ./build_macos.sh
#
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="wifi-vpn-share"
VERSION="1.0.0"
IDENTIFIER="org.customer.wifivpnshare"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERROR: run this on macOS (uname reports '$(uname -s)')." >&2
  echo "PyInstaller/pkgbuild build native macOS artifacts only on a Mac." >&2
  exit 1
fi

command -v python3 >/dev/null 2>&1 || {
  echo "ERROR: python3 not found. Install it (e.g. 'brew install python')." >&2
  exit 1
}

echo "==> Installing PyInstaller (user scope)"
python3 -m pip install --user --quiet --upgrade pyinstaller

echo "==> Building single-file executable (arch: $(uname -m))"
cd "$HERE"
rm -rf build dist ./*.spec
python3 -m PyInstaller --onefile --clean --name "$APP" wifi_vpn_share.py

echo "==> Staging payload for the installer"
PKGROOT="$(mktemp -d)"
mkdir -p "$PKGROOT/usr/local/bin"
cp "dist/$APP" "$PKGROOT/usr/local/bin/$APP"
chmod 755 "$PKGROOT/usr/local/bin/$APP"

echo "==> Building macOS installer (.pkg)"
pkgbuild \
  --root "$PKGROOT" \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location "/" \
  "dist/${APP}-${VERSION}.pkg"

rm -rf "$PKGROOT"

echo ""
echo "Done."
echo "  Binary   : $HERE/dist/$APP"
echo "  Installer: $HERE/dist/${APP}-${VERSION}.pkg"
echo ""
echo "Install with the GUI (double-click the .pkg) or:"
echo "  sudo installer -pkg \"dist/${APP}-${VERSION}.pkg\" -target /"
echo "Then run:  $APP --help"
