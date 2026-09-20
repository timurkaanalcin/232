# LocalForge 1.4.0

Independent macOS folder workspace with **ForgeBot**, an original local assistant.

This is **not Cursor** and **not Grok / xAI**. No Cursor APIs, no `api.x.ai`, no API keys.

Open the app and chat. Folder tools are optional.

This Linux/cloud environment **cannot** compile a Mac `.app` / `.pkg`. Build on a Mac.

---

## What you do

1. Install and open LocalForge.
2. Type in the ForgeBot panel. Replies use a built-in local engine plus the open file / selection.
3. Optional: open a folder (⌘O), edit UTF-8 files, run a local command.

If [Ollama](https://ollama.com) is already running on this Mac, ForgeBot may use `http://127.0.0.1:11434` only. Chat still works with Ollama off — zero cloud.

---

## Yapmanız gerekenler

1. LocalForge’u açın.
2. ForgeBot paneline yazın. Yanıtlar bu Mac’te, açık dosya / seçimle üretilir.
3. İsterseniz klasör açın (⌘O), dosya düzenleyin, yerel komut çalıştırın.

Bu Mac’te Ollama çalışıyorsa yalnızca localhost kullanılır. Ollama yoksa da sohbet çalışır. Hesap veya API anahtarı yoktur.

---

## Two products (build on a Mac)

This zip is **source**, not a Mac installer. Linux/cloud cannot produce a real `.pkg` or runnable `.app`. Build on macOS 14+ with Xcode Command Line Tools (`xcode-select --install`).

**1. Installer app (the package you double-click)**  
`dist/LocalForge-1.4.0.pkg` after a successful build. That is the MacBook installer.

**2. Installed form (the app itself)**  
`dist/LocalForge.app` after the same build. The `.pkg` also copies it to `/Applications/LocalForge.app`.

```bash
# From this folder (zip root, or macos/LocalForge in the git repo)
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh

# Installer
open dist/LocalForge-1.4.0.pkg
# or: sudo installer -pkg dist/LocalForge-1.4.0.pkg -target /

# Installed app (no pkg): open the built bundle, or after the pkg:
open dist/LocalForge.app
open /Applications/LocalForge.app
```

The script **exits with an error on Linux**. The package is unsigned; Gatekeeper may ask you to allow it under System Settings → Privacy & Security.
