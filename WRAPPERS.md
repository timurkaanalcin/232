# CanlıSite kurulum paketleri (PWA + masaüstü + Android)

Sarmalayıcılar **yalnızca** üretim HTTPS uygulamasını açar:
`https://borsahatti.timurkaanalcin.workers.dev`

Konum paylaşımı web uygulamasındaki açık onay akışına bağlıdır. Arka plan izleme, tuş kaydı veya uzaktan kontrol **yoktur**.

## Komutlar

| Komut | Çıktı |
| --- | --- |
| `npm run dist:win` | Windows NSIS kurulum `.exe` + zip (Linux’tan derlenebilir) |
| `npm run dist:mac` | macOS zip (Linux’ta imzasız `.app` zip; `electron-builder --mac` başarısız olursa `electron-packager`) |
| `npm run dist:apk` | Android imzasız debug APK |

Geliştirme: `npm --prefix desktop start` (Electron), `bash scripts/build-apk.sh`.

PWA: tarayıcıda «Ana ekrana ekle» / «Install app». Manifest: `/manifest.webmanifest`.
