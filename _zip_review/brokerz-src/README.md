# BROKERZ / UBS müşteri platformı

Bağımsız Vite + React + TypeScript trading platformı (marketing site, WebTrader, Admin CRM).

Canlı multi-tenant host’lar (`*.customer.org.tr`):

| Host | Marka |
|------|--------|
| `ubs.customer.org.tr` | UBS |
| `7fx.customer.org.tr` | 7FX |
| `tickbase.customer.org.tr` | Tickbase |
| `crmubs.customer.org.tr` | UBS CRM |
| `crm7fx.customer.org.tr` | 7FX CRM |
| `crmtickbase.customer.org.tr` | Tickbase CRM |

Yerelde marka seçimi: `http://localhost:5173/?brand=ubs` (veya `7fx` / `brokerz`). CRM: `?crm=1`.

## Gereksinimler

- Node.js 18+

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Aç: http://localhost:5173/?brand=ubs

## Admin CRM (local)

| Alan | Değer |
|------|--------|
| Email | `admin@brokerz.com` |
| Password | `admin123` |

Veriler tarayıcıda saklanır (`brokerz_local_db_v2`). Sıfırlamak için DevTools → Application → Local Storage.

## Opsiyonel Supabase

Kendi Supabase projeni bağlamak için:

1. `supabase/migrations/*.sql` dosyalarını SQL Editor'da çalıştır
2. `.env` içinde:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Scripts

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Build önizleme |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run template` | Ham BitRader HTML (5174) |

## Natro’ya yayın

```bash
npm run build
```

`dist/` içeriğini `ubs.customer.org.tr` hosting köküne yükleyin (LiteSpeed + `public/.htaccess` SPA rewrite). DNS: `ubs` A kaydı → hosting IP.

## Yapı

| Yol | Açıklama |
|-----|----------|
| `src/lib/brands.ts` | Host → marka çözümleyici (`Fx` / production ile uyumlu) |
| `src/components/Layout.tsx` | Marketing header/footer |
| `src/components/OlympLandingPage.tsx` | UBS / 7FX landing |
| `src/components/TradingTerminal.tsx` | WebTrader |
| `src/components/AdminPanel.tsx` | CRM |
| `src/lib/localStore.ts` | Local CRM |
| `public/api/` | PHP mail bridge (OTP) |
