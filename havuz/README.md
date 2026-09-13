# Havuz

Türkçe çoklu model sohbet sitesi. Anthropic, Cursor, Google, OpenAI, Moonshot, Z.ai ve Meta modelleri **tek havuzda**. Yeni çıkan modeller Netlify AI Gateway canlı kataloğundan otomatik düşer.

UI default language is Turkish, with a TR/EN toggle.

## Nasıl çalışır

1. **Küratör katalog** (`src/lib/catalog.ts`) görünen adları, sağlayıcıyı ve bağlam pencerelerini taşır.
2. **Canlı katalog** her yüklemede (ve Yenile ile) şunlardan birleşir:
   - `GET https://api.netlify.com/api/v1/ai-gateway/providers`
   - Gateway hazırsa OpenAI-uyumlu `GET {OPENAI_BASE_URL}/models`
3. Bilinmeyen yeni ID’ler yine listelenir: sağlayıcı ID’den tahmin edilir, bağlam “—” kalır.
4. Sohbet çağrıları **yalnızca sunucuda** (`netlify/functions/chat.ts`) Netlify AI Gateway üzerinden gider. Tarayıcıya API anahtarı konmaz.
5. Gateway’de olmayan modeller (ör. Composer, henüz pinlenmemiş Codex varyantları) katalogda durur; seçilirse anlamlı bir hata döner.
6. Görsel üretim yalnızca Gemini görsel modellerinde açılır (`gemini-*-image*`). OpenAI image modelleri gateway üzerinden yönlendirilmez.

Liste ~90 saniye önbelleğe alınır (fonksiyon belleği). Sayfa yükünde ve “Modelleri yenile” ile tazelenir.

## Yerel geliştirme

```bash
cd havuz
npm install
npx netlify dev
```

`netlify dev` Vite’i 5173’te sarıp fonksiyonları (`/api/models`, `/api/chat`) bağlar. Repo kökünden de çalışır: kök `netlify.toml` `base = "havuz"` kullanır.

Vite eklentisiyle (fonksiyonlar + env):

```bash
npm run dev
```

İlk production deploy olmadan AI Gateway anahtarları enjekte edilmez. Bu ortamda sohbet, model yoksa veya gateway kapalıysa açık bir hata (veya `dev` context’te kısa bir yerel önizleme metni) döner.

## Ortam değişkenleri

**Kendi `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` değerlerinizi set etmeyin.** Bunlar Netlify’nin gateway enjeksiyonunu ezer ve isteği doğrudan sağlayıcıya yollar.

Netlify, AI özellikleri açık bir sitede şunları otomatik basar:

| Değişken | Rol |
|---|---|
| `OPENAI_API_KEY`, `OPENAI_BASE_URL` | OpenAI SDK |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` | Anthropic SDK |
| `GEMINI_API_KEY`, `GOOGLE_GEMINI_BASE_URL` | Gemini SDK |
| `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL` | OpenRouter (Grok, Kimi, GLM, …) |
| `NETLIFY_AI_GATEWAY_KEY` | Evrensel anahtar (asla çakışmaz) |
| `NETLIFY_AI_GATEWAY_BASE_URL` veya `NETLIFY_AI_GATEWAY_URL` | Evrensel uç |

Fonksiyonlar sırları `Netlify.env.get("VAR")` ile okur; `process.env` kullanılmaz.

Sohbet geçmişi tarayıcıda `localStorage` içindedir. Blobs yalnızca üretilen görseller içindir (dosya), sohbet kayıtları için Database yoktur.

## Deploy

1. Netlify’ye giriş: `npx netlify login`
2. Site bağla veya oluştur: `npx netlify init` (base: `havuz`, publish: `dist`, command: `npm run build`)
3. **En az bir production deploy** yapın — AI Gateway bundan sonra açılır:
   ```bash
   cd havuz && npm run build && npx netlify deploy --prod --dir=dist
   ```
   veya Git ile `main` push (kök `netlify.toml` base’i `havuz` yapar).
4. Netlify UI’da **AI Features** açık olsun.
5. Preview: PR deploy veya `npx netlify deploy` (draft URL).

Gizli anahtar uydurmayın ve commit etmeyin.

## Pinlenen gateway kimlikleri

UI tam küratör listeyi gösterir. Çağrı yalnızca gateway’in gerçekten sunduğu ID’ye pinlenir (`resolvedGatewayId`). Canlı listede yoksa model “Gateway’de yok” rozeti alır.

## Masaüstü ve Android

Kurulum dosyaları GitHub Actions `Havuz clients` işinden üretilir (imzasız):

- Windows: Electron NSIS `.exe`
- macOS: Electron `.dmg` (Gatekeeper: sağ tık → Aç)
- Android: Capacitor debug `.apk` (bilinmeyen kaynaklardan yükleme)

Paketli istemciler gömülü arayüzü açar. Gerçek model yanıtları için Ayarlar → **Sunucu adresi** alanına Netlify production URL’sini yazın (`VITE_HAVUZ_API_BASE` veya `HAVUZ_SITE_URL` ile de verilebilir). İlk production deploy + AI Features şarttır. İmzalı store paketleri için sır yok; CI imzasız üretir.

```bash
cd havuz
npm run electron:dist   # bulunduğunuz OS için
```

Android APK CI’da `npx cap add android && ./gradlew assembleDebug` ile üretilir.

## Komutlar

```bash
npm run dev       # Vite + @netlify/vite-plugin
npm run build     # tsc + vite build
npm test          # katalog birleştirme testleri
npx netlify dev   # önerilen uçtan uca yerel yol
```
