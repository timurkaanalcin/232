# Nexus — AI Model Pool

Claude, GPT, Gemini, Grok, Kimi, GLM and every model Netlify’s AI Gateway adds next. Featured cards keep your requested roster pinned; `/api/models` refreshes from the live gateway catalog so new releases appear automatically.

## Run locally

```bash
cd apps/nexus
npm install
npm run dev
```

Open http://localhost:5173

Chat is **local GGUF only** — no cloud AI. Every featured slot (Claude / GPT / Gemini / Grok / Kimi / GLM / Composer / Muse) talks to a local Dolphin 3 uncensored Llama 3.2 3B GGUF via llama.cpp. These are not vendor weights; those are not published as GGUF.

```bash
bash scripts/setup-gguf.sh   # once: llama.cpp + ~2GB GGUF
npm run llama                # local engine on :8088
npm run dev                  # UI on :5173
```

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
