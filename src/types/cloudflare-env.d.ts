import type { LocationHub } from "@/realtime/location-hub";
import type { RateLimiterDO } from "@/realtime/rate-limiter";

declare global {
  /**
   * Bindings available on the Worker environment.
   * Keep in sync with wrangler.jsonc (or regenerate with `npm run cf:typegen`
   * and re-add the secret declarations below).
   */
  interface CloudflareEnv {
    // Bindings
    DB: D1Database;
    LOCATION_HUB: DurableObjectNamespace<LocationHub>;
    RATE_LIMITER: DurableObjectNamespace<RateLimiterDO>;
    ASSETS: Fetcher;

    // Vars
    AUTH_TRUST_HOST: string;

    // Secrets (set via `wrangler secret put` / `.dev.vars` locally)
    AUTH_SECRET: string;
    AUTH_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
  }
}

export {};
