import { buildLocalCatalog } from "../../../src/lib/local-catalog";
import { engineReady } from "../../../src/lib/local-engine";
import type { PoolModel } from "../../../src/lib/types";

export async function loadCatalog(_force = false): Promise<{
  models: PoolModel[];
  source: "live" | "seed";
  fetchedAt: string;
  gatewayReady: boolean;
}> {
  const models = buildLocalCatalog();
  return {
    models,
    source: "live",
    fetchedAt: new Date().toISOString(),
    gatewayReady: await engineReady(),
  };
}
