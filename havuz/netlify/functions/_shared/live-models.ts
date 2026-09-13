import { mergePool, type LiveEntry } from "../../../src/lib/catalog";
import { gatewaySecrets, isGatewayReady } from "./env";

const PROVIDERS_URL = "https://api.netlify.com/api/v1/ai-gateway/providers";
const CACHE_TTL_MS = 90_000;

type Cache = {
  entries: LiveEntry[];
  fetchedAt: number;
  error?: string;
};

let cache: Cache | null = null;

interface ProvidersPayload {
  providers?: Record<string, { models?: string[] | Record<string, unknown> }>;
}

function flattenProviders(payload: ProvidersPayload): LiveEntry[] {
  const entries: LiveEntry[] = [];
  for (const [provider, data] of Object.entries(payload.providers ?? {})) {
    const models = data.models;
    if (Array.isArray(models)) {
      for (const id of models) entries.push({ id, provider });
    } else if (models && typeof models === "object") {
      for (const id of Object.keys(models)) entries.push({ id, provider });
    }
  }
  return entries;
}

async function fetchOpenAiCompatible(base: string, key: string): Promise<LiveEntry[]> {
  const url = `${base.replace(/\/$/, "")}/models`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: Array<{ id?: string }>; models?: Array<{ id?: string }> };
  const rows = json.data ?? json.models ?? [];
  return rows
    .map((row) => row.id)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ id, provider: "openai-compat" }));
}

export async function loadLiveModels(force = false): Promise<{
  entries: LiveEntry[];
  fetchedAt: string;
  cacheTtlMs: number;
  error?: string;
}> {
  const now = Date.now();
  if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return {
      entries: cache.entries,
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
      cacheTtlMs: CACHE_TTL_MS,
      error: cache.error,
    };
  }

  const errors: string[] = [];
  const byId = new Map<string, LiveEntry>();

  try {
    const res = await fetch(PROVIDERS_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      errors.push(`providers ${res.status}`);
    } else {
      const payload = (await res.json()) as ProvidersPayload;
      for (const entry of flattenProviders(payload)) {
        byId.set(entry.id.toLowerCase(), entry);
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "providers fetch failed");
  }

  const secrets = gatewaySecrets();
  const compatBase = secrets.openaiBase ?? secrets.gatewayBase;
  const compatKey = secrets.openaiKey ?? secrets.gatewayKey;
  if (compatBase && compatKey) {
    try {
      for (const entry of await fetchOpenAiCompatible(compatBase, compatKey)) {
        if (!byId.has(entry.id.toLowerCase())) byId.set(entry.id.toLowerCase(), entry);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "openai models fetch failed");
    }
  }

  const entries = [...byId.values()];
  cache = {
    entries,
    fetchedAt: now,
    error: errors.length ? errors.join(" · ") : undefined,
  };

  return {
    entries,
    fetchedAt: new Date(now).toISOString(),
    cacheTtlMs: CACHE_TTL_MS,
    error: cache.error,
  };
}

export async function loadPool(force = false) {
  const live = await loadLiveModels(force);
  return {
    models: mergePool(live.entries),
    fetchedAt: live.fetchedAt,
    cacheTtlMs: live.cacheTtlMs,
    gatewayReady: isGatewayReady(),
    liveCount: live.entries.length,
    newCount: mergePool(live.entries).filter((m) => m.isNew).length,
    error: live.error,
  };
}
