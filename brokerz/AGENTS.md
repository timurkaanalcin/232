# AGENTS.md

## Project Context

BROKERZ — standalone Vite/React/TypeScript trading platform. No Bolt / StackBlitz dependency.

Default CRM backend is `localStorage` (`src/lib/localStore.ts`). Supabase is optional via `VITE_DATA_MODE=supabase`.

## Key Paths

- `src/lib/supabase.ts` — data client switch (local | supabase)
- `src/lib/localStore.ts` — browser CRM seed + CRUD
- `src/components/Layout.tsx` / `LandingPage.tsx` — BitRader marketing chrome
- `src/lib/templateAssets.ts` — load/unload marketing CSS/JS
- `src/components/TradingTerminal.tsx` / `AdminPanel.tsx` — Tailwind apps (`#tw-app.tw-scope`)

## Local Dev

```bash
npm install && cp .env.example .env && npm run dev
```

Admin (local): `admin@brokerz.com` / `admin123`
