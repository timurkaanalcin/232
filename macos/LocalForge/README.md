# LocalForge

Independent macOS folder workspace with optional **Grok** assist via the official **xAI API**.

This is **not Cursor**: no Cursor login, no Cursor models gateway, no Cursor agent protocol, and no cloned Cursor UI. Branding is original (warm paper / copper atelier).

This Linux/cloud environment **cannot** compile a working Mac `.app` or `.pkg`. Do not expect a prebuilt installer in git. Build on a Mac.

---

## English

### What it is

Open a folder, browse and filter files, edit UTF-8 text, run a local shell command, and optionally chat with Grok. Grok can attach the current file and/or the editor selection as context.

### What it is not

- Not Cursor (no Cursor name, logo, Agent sidebar, Composer, or Cursor model picker)
- Not a Cursor pirate / unofficial license
- Chat goes only to `https://api.x.ai/v1/chat/completions` with **your** key

### Requirements

- macOS 14+
- Xcode Command Line Tools: `xcode-select --install`
- An xAI API key from [https://console.x.ai](https://console.x.ai)

### Set `XAI_API_KEY` (never commit it)

Pick one:

1. **In the app (Keychain):** Grok menu → **xAI API Key…**, paste the key, **Save to Keychain**.
2. **Environment:** `export XAI_API_KEY="xai-..."` then launch LocalForge from that shell.
3. **Local file (outside git):** `~/.localforge.env` or `~/Library/Application Support/LocalForge/.env` with:

```
XAI_API_KEY=xai-...
```

### Chat with Grok

1. Show the Grok panel (⌘L) if it is hidden.
2. Optionally tick **Attach current file** and/or **Attach selection**.
3. Type a question and press **Send** (or ⌘↩).
4. Default model is `grok-4.6` (documented on xAI Chat Completions). Change it in Settings if your account uses another public id (`grok-3`, `grok-2`, …).

### Build the `.pkg` (Mac only)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Output:

- `dist/LocalForge.app`
- `dist/LocalForge-1.2.0.pkg`

Install: double-click the `.pkg`, or:

```bash
sudo installer -pkg dist/LocalForge-1.2.0.pkg -target /
```

The script **exits with an error on Linux**. The package is unsigned; macOS Gatekeeper may require allowing it under System Settings → Privacy & Security.

### Features

- Open a project folder (⌘O)
- File tree with search/filter (⌘F)
- UTF-8 editor, save (⌘S), unsaved-change warning (including quit)
- New file (⌘N), refresh tree (⇧⌘R), reveal in Finder (⌥⌘R)
- Command console in the project folder (⌘R run, ⌘. stop, ⌘J show/hide)
- Grok assist panel (⌘L) via official xAI API
- Status bar: path, dirty state, line/char counts, encoding, last exit code

---

## Türkçe

### Nedir

Yerel klasör çalışma alanı: dosya ağacı, UTF-8 düzenleme, kabuk komutu ve isteğe bağlı **Grok** yardımı. Grok, açık dosyayı veya seçili metni bağlama olarak gönderebilir.

### Ne değildir

- **Cursor değildir** (Cursor girişi, modeller ağ geçidi, ajan protokolü yok)
- Cursor kopyası / lisans ihlali değildir
- Sohbet yalnızca resmi xAI uç noktasına, sizin anahtarınızla gider

### Gereksinimler

- macOS 14+
- Xcode Command Line Tools: `xcode-select --install`
- [https://console.x.ai](https://console.x.ai) adresinden xAI API anahtarı

### `XAI_API_KEY` ayarı (repoya koymayın)

1. **Uygulama (Keychain):** Grok menüsü → **xAI API Key…** → yapıştırın → **Save to Keychain**.
2. **Ortam değişkeni:** `export XAI_API_KEY="xai-..."`
3. **Yerel dosya:** `~/.localforge.env` veya `~/Library/Application Support/LocalForge/.env` içinde `XAI_API_KEY=...`

### Grok ile sohbet

1. Grok panelini açın (⌘L).
2. İsterseniz açık dosyayı ve/veya seçimi ekleyin.
3. Soruyu yazıp **Send** / ⌘↩.
4. Varsayılan model `grok-4.6`. Hesabınız başka bir genel kimlik kullanıyorsa Ayarlar’dan değiştirin.

### `.pkg` derleme (yalnızca Mac)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Çıktı: `dist/LocalForge.app` ve `dist/LocalForge-1.2.0.pkg`. Betik **Linux’ta hata verip çıkar**.
