# BROKERZ

Bağımsız Vite + React + TypeScript trading platformı (marketing site, WebTrader, Admin CRM).

Bolt / StackBlitz gerektirmez. Varsayılan veri katmanı tarayıcı `localStorage` üzerindedir.

## Gereksinimler

- Node.js 18+

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Aç: http://localhost:5173

## Admin CRM (local)

| Alan | Değer |
|------|--------|
| Email | `admin@brokerz.com` |
| Password | `admin123` |

Veriler tarayıcıda saklanır (`brokerz_local_db_v1`). Sıfırlamak için DevTools → Application → Local Storage.

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
| `npm run build` | Production build |
| `npm run preview` | Build önizleme |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run template` | Ham BitRader HTML (5174) |

## Yapı

| Yol | Açıklama |
|-----|----------|
| `src/components/Layout.tsx` | Marketing header/footer |
| `src/components/LandingPage.tsx` | Ana sayfa |
| `src/components/TradingTerminal.tsx` | WebTrader |
| `src/components/AdminPanel.tsx` | CRM |
| `src/lib/localStore.ts` | Local CRM (Bolt bağımsız) |
| `src/lib/supabase.ts` | Data client (local / supabase) |
| `public/assets/` | BitRader CSS/JS |
| `supabase/migrations/` | Opsiyonel şema |

## Build

```bash
npm run build
npm run preview
```
