#!/usr/bin/env bash
# build.sh — Build a single-file Linux executable for wifi_vpn_share.
# (For macOS use build_macos.sh ON a Mac.)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"
command -v python3 >/dev/null || { echo "python3 required" >&2; exit 1; }
python3 -m pip install --user --quiet --upgrade pyinstaller
rm -rf build dist ./*.spec
python3 -m PyInstaller --onefile --clean --name wifi-vpn-share wifi_vpn_share.py
echo "Built: $HERE/dist/wifi-vpn-share"
