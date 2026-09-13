import type { Config, Context } from "@netlify/functions";
import { loadPool } from "./_shared/live-models";
import { clientIp, limitModels } from "./_shared/rate-limit";
import { CORS_HEADERS, corsOptions, jsonError } from "./_shared/sse";

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return corsOptions();
  }
  if (req.method !== "GET") {
    return jsonError("Method not allowed", 405);
  }

  const limited = limitModels(clientIp(req));
  if (!limited.ok) {
    return jsonError("Çok sık yenilendi. Biraz bekleyin.", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("refresh") === "1";
  const pool = await loadPool(force);
  return Response.json(pool, {
    headers: {
      "Cache-Control": "private, max-age=15",
      ...CORS_HEADERS,
    },
  });
};

export const config: Config = {
  path: "/api/models",
  method: ["GET", "OPTIONS"],
};
