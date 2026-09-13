# LocalForge

Original macOS workspace app — **not** Cursor, not a clone.

LocalForge is a small, from-scratch SwiftUI app for opening a folder, editing text files, and running a local command. Branding, UI, and code are original.

This Linux environment cannot compile a signed Mac `.pkg`. Build the installer **on a Mac** with Xcode Command Line Tools.

## Build `.pkg` on a Mac

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Output:

- `dist/LocalForge.app`
- `dist/LocalForge-1.0.0.pkg`

Install: double-click the `.pkg`, or `sudo installer -pkg dist/LocalForge-1.0.0.pkg -target /`

## Requirements

- macOS 14+
- `xcode-select --install`

## What it does

- Open a project folder
- Browse files
- Edit UTF-8 text
- Save
- Run a shell command in the project root (opt-in)

## What it does not do

- Cursor Agent / models / login
- Cursor UI or trademarks
- Unlimited or unofficial Cursor licensing
