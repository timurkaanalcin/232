import { buildCatalog, GATEWAY_PROVIDERS_URL } from "../../../src/lib/catalog";
import type { LiveProviderMap, PoolModel } from "../../../src/lib/types";
import { gatewayReady } from "./env";

type Cache = {
  at: number;
  models: PoolModel[];
  source: "live" | "seed";
};

const TTL_MS = 60_000;
let cache: Cache | null = null;

export async function loadCatalog(force = false): Promise<{
  models: PoolModel[];
  source: "live" | "seed";
  fetchedAt: string;
  gatewayReady: boolean;
}> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) {
    return {
      models: cache.models,
      source: cache.source,
      fetchedAt: new Date(cache.at).toISOString(),
      gatewayReady: gatewayReady(),
    };
  }

  try {
    const response = await fetch(GATEWAY_PROVIDERS_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`catalog ${response.status}`);
    }
    const payload = (await response.json()) as { providers?: LiveProviderMap };
    const models = buildCatalog(payload.providers ?? null);
    cache = { at: Date.now(), models, source: "live" };
    return {
      models,
      source: "live",
      fetchedAt: new Date(cache.at).toISOString(),
      gatewayReady: gatewayReady(),
    };
  } catch {
    const models = buildCatalog(null);
    cache = { at: Date.now(), models, source: "seed" };
    return {
      models,
      source: "seed",
      fetchedAt: new Date(cache.at).toISOString(),
      gatewayReady: gatewayReady(),
    };
  }
}
