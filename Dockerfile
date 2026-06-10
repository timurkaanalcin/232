# LiveTrack — container image for local development and preview builds.
#
# Note: production runs on Cloudflare Workers (see DEPLOYMENT.md). This image
# is for running the Next.js dev server / preview locally in a reproducible
# environment, and for CI.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime (dev server / preview) ----
FROM base AS runtime
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
