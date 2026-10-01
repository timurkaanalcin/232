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

## Build the `.pkg` (Mac only)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Output: `dist/LocalForge.app` and `dist/LocalForge-1.4.0.pkg`.

```bash
sudo installer -pkg dist/LocalForge-1.4.0.pkg -target /
```

The script **exits with an error on Linux**. The package is unsigned; Gatekeeper may ask you to allow it under System Settings → Privacy & Security.
