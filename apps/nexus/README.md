# Nexus — AI Model Pool

Claude, GPT, Gemini, Grok, Kimi, GLM and every model Netlify’s AI Gateway adds next. Featured cards keep your requested roster pinned; `/api/models` refreshes from the live gateway catalog so new releases appear automatically.

## Run locally

```bash
cd apps/nexus
npm install
npm run dev
```

Open http://localhost:5173

Chat streams through Netlify Functions. Real provider replies need one production deploy on Netlify with AI Features enabled (the gateway injects keys after that). Until then, the UI stays fully usable and returns a local preview stream.

## Deploy

From the repo root (or `apps/nexus`):

```bash
npx netlify deploy --prod
```

`netlify.toml` already points the site at `apps/nexus`. Do not set your own `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY` if you want the gateway to stay in front.

## Scripts

- `npm run dev` — Vite + Netlify functions
- `npm run build` — production build
- `npm test` — catalog merge tests
- `npm run typecheck` — TypeScript
