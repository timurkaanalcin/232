/**
 * Custom Worker entrypoint.
 *
 * Wraps the OpenNext-generated fetch handler and adds:
 *  - WebSocket upgrade routing to the LocationHub Durable Object
 *  - Durable Object class exports (LocationHub, RateLimiterDO)
 */

// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as nextHandler } from "./.open-next/worker.js";

import { handleRealtimeUpgrade } from "./src/realtime/upgrade";

export { LocationHub } from "./src/realtime/location-hub";
export { RateLimiterDO } from "./src/realtime/rate-limiter";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/realtime/ws") {
      return handleRealtimeUpgrade(request, env);
    }

    return nextHandler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<CloudflareEnv>;
