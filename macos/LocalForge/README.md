# LocalForge

Original macOS folder workspace — **not Cursor**, not a clone, not an AI agent.

LocalForge is a small SwiftUI app: open a folder, browse and filter files, edit UTF-8 text, save, and run a local shell command in that folder. Branding, layout, and colors are original (warm paper / copper atelier — not a zinc dark agent UI).

This Linux/cloud environment **cannot** compile a working Mac `.app` or `.pkg`. Do not expect a prebuilt installer in git. Build on a Mac.

---

## English

### What it is

A local workspace for text files and commands. All work stays on your Mac.

### What it is not

- Not Cursor (no Cursor name, logo, Agent sidebar, Composer, or model picker)
- Not a cloud coding agent
- Not an unofficial Cursor license

### Requirements

- macOS 14+
- Xcode Command Line Tools: `xcode-select --install`

### Build the `.pkg` (Mac only)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Output:

- `dist/LocalForge.app`
- `dist/LocalForge-1.1.0.pkg`

Install: double-click the `.pkg`, or:

```bash
sudo installer -pkg dist/LocalForge-1.1.0.pkg -target /
```

The script **exits with an error on Linux**. The package is unsigned; macOS Gatekeeper may require allowing it under System Settings → Privacy & Security.

### Features

- Open a project folder (⌘O)
- File tree with search/filter (⌘F)
- UTF-8 editor, save (⌘S), unsaved-change warning (including quit)
- New file (⌘N), refresh tree (⇧⌘R), reveal in Finder (⌥⌘R)
- Command console in the project folder (⌘R run, ⌘. stop, ⌘J show/hide)
- Status bar: path, dirty state, line/char counts, encoding, last exit code
- Empty states and error alerts for binary/huge files and I/O failures

---

## Türkçe

### Nedir

Yerel bir klasör çalışma alanı: dosya ağacı, UTF-8 metin düzenleme, kaydetme ve proje klasöründe kabuk komutu. Ağ’a bir şey gönderilmez.

### Ne değildir

- **Cursor değildir** (Cursor adı, logosu, Agent kenar çubuğu, Composer, model seçici yok)
- Bulut ajanı / sohbet arayüzü değildir
- Resmi olmayan bir Cursor lisansı değildir

### Gereksinimler

- macOS 14+
- Xcode Command Line Tools: `xcode-select --install`

### `.pkg` derleme (yalnızca Mac)

```bash
cd macos/LocalForge
chmod +x scripts/build-pkg.sh
./scripts/build-pkg.sh
```

Çıktı:

- `dist/LocalForge.app`
- `dist/LocalForge-1.1.0.pkg`

Kurulum: `.pkg` dosyasına çift tıklayın veya:

```bash
sudo installer -pkg dist/LocalForge-1.1.0.pkg -target /
```

Betik **Linux’ta hata verip çıkar**. Paket imzasızdır; Gatekeeper Sistem Ayarları → Gizlilik ve Güvenlik altında izin isteyebilir.

### Özellikler

- Klasör açma, dosya süzme, UTF-8 düzenleyici, kaydetme
- Kaydedilmemiş değişiklik uyarısı
- Yerel komut konsolu, durum çubuğu, boş durumlar, hata uyarıları
