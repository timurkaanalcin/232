# LocalForge 1.3.0

Independent macOS folder workspace. Chat with **Grok** (xAI) using **your** key.

This is **not Cursor**. No Cursor APIs, login, or UI clone.

This Linux/cloud environment **cannot** compile a Mac `.app` / `.pkg`. Build on a Mac.

---

## What you do (only this)

1. **Create or sign in** at [https://console.x.ai](https://console.x.ai) (in the app: **Üye ol / anahtar al**).
2. **Paste the API key once** into LocalForge (saved in Keychain).

Then chat. Open file and editor selection are attached automatically — no extra toggles.

If `XAI_API_KEY` is already in the environment or `~/.localforge.env` exists, onboarding is skipped and chat opens.

Never commit the key. Ignore any key pasted in chat history.

---

## Yapmanız gerekenler (yalnızca bunlar)

1. [https://console.x.ai](https://console.x.ai) üzerinde **üye olun / giriş yapın** (uygulamada **Üye ol / anahtar al**).
2. API anahtarını **bir kez yapıştırın** (Keychain).

Sonra Grok ile sohbet. Açık dosya ve seçim otomatik eklenir.

`XAI_API_KEY` veya `~/.localforge.env` zaten varsa kurulum atlanır.

---

## Build the `.pkg` (Mac only)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Output: `dist/LocalForge.app` and `dist/LocalForge-1.3.0.pkg`.

```bash
sudo installer -pkg dist/LocalForge-1.3.0.pkg -target /
```

The script **exits with an error on Linux**. The package is unsigned; Gatekeeper may ask you to allow it under System Settings → Privacy & Security.

---

## Optional (not required to chat)

- Open a folder (⌘O), edit UTF-8 files, run a local command.
- Other Grok model ids appear in the panel if your xAI account lists them.
- Alternative key locations: `export XAI_API_KEY=...` or `~/.localforge.env` with `XAI_API_KEY=...`.
