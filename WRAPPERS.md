# CanlıSite kurulum paketleri (PWA + masaüstü + Android)

Sarmalayıcılar **yalnızca** üretim HTTPS uygulamasını açar:

`https://borsahatti.timurkaanalcin.workers.dev`

Konum paylaşımı web uygulamasındaki açık onay akışına bağlıdır. Arka plan izleme, tuş kaydı veya uzaktan kontrol **yoktur**.

## Komutlar

| Komut | Çıktı |
| --- | --- |
| `npm run dist:win` | Windows NSIS `desktop/dist/canlisite_windows_setup.exe` + taşınabilir zip. Linux’ta NSIS için `wine` + `wine32:i386` gerekir; yoksa taşınabilir zip üretilir. |
| `npm run dist:mac` | macOS zip. Linux’ta `electron-builder --mac` genelde imza yüzünden düşer; betik `electron-packager` ile imzasız `CanliSite.app` zip üretir (`canlisite_macos_arm64.zip` / `canlisite_macos_x64.zip`). |
| `npm run dist:apk` | Android imzasız **debug** APK (`native/android/app/build/outputs/apk/debug/app-debug.apk`). JDK + Android SDK (`ANDROID_HOME`) gerekir. |

Geliştirme: `npm --prefix desktop start` (Electron).

PWA: tarayıcıda «Uygulamayı yükle» / «Ana ekrana ekle». Manifest: `/manifest.webmanifest`.
