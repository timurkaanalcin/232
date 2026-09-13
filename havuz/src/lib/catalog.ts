import type { CatalogModel, ContextTokens, PoolModel, ProviderId } from "./types";

const k = (n: number): ContextTokens => n;
const none: ContextTokens = null;

export const CURATED_MODELS: CatalogModel[] = [
  {
    id: "claude-4-sonnet",
    provider: "anthropic",
    displayName: "Claude 4 Sonnet",
    defaultContext: k(200_000),
    maxContext: none,
    gatewayIds: ["claude-sonnet-4-0", "claude-sonnet-4-20250514"],
    aliases: ["claude-sonnet-4", "claude-4-sonnet"],
    curated: true,
  },
  {
    id: "claude-4-sonnet-1m",
    provider: "anthropic",
    displayName: "Claude 4 Sonnet 1M",
    defaultContext: none,
    maxContext: k(1_000_000),
    gatewayIds: ["claude-sonnet-4-0", "claude-sonnet-4-20250514"],
    aliases: ["claude-sonnet-4-1m"],
    curated: true,
  },
  {
    id: "claude-4.5-haiku",
    provider: "anthropic",
    displayName: "Claude 4.5 Haiku",
    defaultContext: k(200_000),
    maxContext: none,
    gatewayIds: ["claude-haiku-4-5", "claude-haiku-4-5-20251001"],
    curated: true,
  },
  {
    id: "claude-4.5-opus",
    provider: "anthropic",
    displayName: "Claude 4.5 Opus",
    defaultContext: k(200_000),
    maxContext: k(200_000),
    gatewayIds: ["claude-opus-4-5", "claude-opus-4-5-20251101"],
    curated: true,
  },
  {
    id: "claude-4.5-sonnet",
    provider: "anthropic",
    displayName: "Claude 4.5 Sonnet",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-sonnet-4-5", "claude-sonnet-4-5-20250929"],
    curated: true,
  },
  {
    id: "claude-4.6-opus",
    provider: "anthropic",
    displayName: "Claude 4.6 Opus",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-opus-4-6"],
    curated: true,
  },
  {
    id: "claude-4.6-sonnet",
    provider: "anthropic",
    displayName: "Claude 4.6 Sonnet",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-sonnet-4-6"],
    curated: true,
  },
  {
    id: "claude-4.7-opus",
    provider: "anthropic",
    displayName: "Claude 4.7 Opus",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-opus-4-7"],
    curated: true,
  },
  {
    id: "claude-fable-5",
    provider: "anthropic",
    displayName: "Claude Fable 5",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-fable-5"],
    curated: true,
  },
  {
    id: "claude-fable-5.1",
    provider: "anthropic",
    displayName: "Claude Fable 5.1",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-fable-5-1"],
    aliases: ["claude-fable-5.1"],
    curated: true,
  },
  {
    id: "claude-opus-4.7-fast",
    provider: "anthropic",
    displayName: "Claude Opus 4.7 (fast mode)",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-opus-4-7"],
    aliases: ["claude-opus-4-7-fast"],
    curated: true,
  },
  {
    id: "claude-opus-4.8",
    provider: "anthropic",
    displayName: "Claude Opus 4.8",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-opus-4-8"],
    curated: true,
  },
  {
    id: "claude-opus-5",
    provider: "anthropic",
    displayName: "Claude Opus 5",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-opus-5"],
    curated: true,
  },
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    displayName: "Claude Sonnet 5",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["claude-sonnet-5"],
    curated: true,
  },
  {
    id: "composer-1",
    provider: "cursor",
    displayName: "Composer 1",
    defaultContext: k(200_000),
    maxContext: none,
    gatewayIds: [],
    aliases: ["composer-1", "cursor/composer-1"],
    curated: true,
  },
  {
    id: "composer-2.5",
    provider: "cursor",
    displayName: "Composer 2.5",
    defaultContext: k(200_000),
    maxContext: none,
    gatewayIds: [],
    aliases: ["composer-2.5", "cursor/composer-2.5"],
    curated: true,
  },
  {
    id: "grok-4.5",
    provider: "cursor",
    displayName: "Grok 4.5",
    defaultContext: k(256_000),
    maxContext: none,
    gatewayIds: ["x-ai/grok-4.5"],
    aliases: ["grok-4.5"],
    curated: true,
  },
  {
    id: "grok-4.6",
    provider: "cursor",
    displayName: "Grok 4.6",
    defaultContext: k(256_000),
    maxContext: none,
    gatewayIds: ["x-ai/grok-4.6"],
    aliases: ["grok-4.6"],
    curated: true,
  },
  {
    id: "gemini-2.5-flash",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-2.5-flash"],
    curated: true,
  },
  {
    id: "gemini-3-flash",
    provider: "google",
    displayName: "Gemini 3 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3-flash-preview"],
    aliases: ["gemini-3-flash"],
    curated: true,
  },
  {
    id: "gemini-3-pro",
    provider: "google",
    displayName: "Gemini 3 Pro",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3-pro", "gemini-3-pro-preview"],
    curated: true,
  },
  {
    id: "gemini-3-pro-image-preview",
    provider: "google",
    displayName: "Gemini 3 Pro Image Preview",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3-pro-image", "gemini-3-pro-image-preview"],
    curated: true,
    imageCapable: true,
    capabilities: ["chat", "image"],
  },
  {
    id: "gemini-3.1-pro",
    provider: "google",
    displayName: "Gemini 3.1 Pro",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3.1-pro-preview"],
    aliases: ["gemini-3.1-pro"],
    curated: true,
  },
  {
    id: "gemini-3.5-flash",
    provider: "google",
    displayName: "Gemini 3.5 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3.5-flash"],
    curated: true,
  },
  {
    id: "gemini-3.6-flash",
    provider: "google",
    displayName: "Gemini 3.6 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3.6-flash"],
    curated: true,
  },
  {
    id: "gemini-3.7-flash",
    provider: "google",
    displayName: "Gemini 3.7 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3.7-flash"],
    curated: true,
  },
  {
    id: "gemini-3.8-flash",
    provider: "google",
    displayName: "Gemini 3.8 Flash",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gemini-3.8-flash"],
    curated: true,
  },
  {
    id: "glm-5.2",
    provider: "zai",
    displayName: "GLM 5.2",
    defaultContext: k(200_000),
    maxContext: none,
    gatewayIds: ["z-ai/glm-5.2"],
    aliases: ["glm-5.2"],
    curated: true,
  },
  {
    id: "gpt-5",
    provider: "openai",
    displayName: "GPT-5",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5", "gpt-5-2025-08-07"],
    curated: true,
  },
  {
    id: "gpt-5-fast",
    provider: "openai",
    displayName: "GPT-5 Fast",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5-fast"],
    aliases: ["gpt-5-chat-latest"],
    curated: true,
  },
  {
    id: "gpt-5-mini",
    provider: "openai",
    displayName: "GPT-5 Mini",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5-mini", "gpt-5-mini-2025-08-07"],
    curated: true,
  },
  {
    id: "gpt-5-codex",
    provider: "openai",
    displayName: "GPT-5-Codex",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5-codex"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.1-codex",
    provider: "openai",
    displayName: "GPT-5.1 Codex",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.1-codex"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.1-codex-max",
    provider: "openai",
    displayName: "GPT-5.1 Codex Max",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.1-codex-max"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.1-codex-mini",
    provider: "openai",
    displayName: "GPT-5.1 Codex Mini",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.1-codex-mini"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.2",
    provider: "openai",
    displayName: "GPT-5.2",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.2", "gpt-5.2-2025-12-11"],
    curated: true,
  },
  {
    id: "gpt-5.2-codex",
    provider: "openai",
    displayName: "GPT-5.2 Codex",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.2-codex"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.3-codex",
    provider: "openai",
    displayName: "GPT-5.3 Codex",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.3-codex"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "gpt-5.4",
    provider: "openai",
    displayName: "GPT-5.4",
    defaultContext: k(272_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gpt-5.4", "gpt-5.4-2026-03-05"],
    curated: true,
  },
  {
    id: "gpt-5.4-mini",
    provider: "openai",
    displayName: "GPT-5.4 Mini",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.4-mini", "gpt-5.4-mini-2026-03-17"],
    curated: true,
  },
  {
    id: "gpt-5.4-nano",
    provider: "openai",
    displayName: "GPT-5.4 Nano",
    defaultContext: k(272_000),
    maxContext: none,
    gatewayIds: ["gpt-5.4-nano", "gpt-5.4-nano-2026-03-17"],
    curated: true,
  },
  {
    id: "gpt-5.5",
    provider: "openai",
    displayName: "GPT-5.5",
    defaultContext: k(272_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gpt-5.5", "gpt-5.5-2026-04-23"],
    curated: true,
  },
  {
    id: "gpt-5.6-luna",
    provider: "openai",
    displayName: "GPT-5.6 Luna",
    defaultContext: k(272_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gpt-5.6-luna"],
    curated: true,
  },
  {
    id: "gpt-5.6-sol",
    provider: "openai",
    displayName: "GPT-5.6 Sol",
    defaultContext: k(272_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gpt-5.6-sol"],
    curated: true,
  },
  {
    id: "gpt-5.6-terra",
    provider: "openai",
    displayName: "GPT-5.6 Terra",
    defaultContext: k(272_000),
    maxContext: k(1_000_000),
    gatewayIds: ["gpt-5.6-terra"],
    curated: true,
  },
  {
    id: "kimi-k2.7-code",
    provider: "moonshot",
    displayName: "Kimi K2.7 Code",
    defaultContext: k(262_000),
    maxContext: none,
    gatewayIds: ["moonshotai/kimi-k2.7-code"],
    aliases: ["kimi-k2.7-code"],
    capabilities: ["chat", "code"],
    curated: true,
  },
  {
    id: "kimi-k3",
    provider: "moonshot",
    displayName: "Kimi K3",
    defaultContext: k(200_000),
    maxContext: k(1_000_000),
    gatewayIds: ["moonshotai/kimi-k3"],
    aliases: ["kimi-k3"],
    curated: true,
  },
  {
    id: "muse-spark-1.3",
    provider: "meta",
    displayName: "Muse Spark 1.3",
    defaultContext: k(300_000),
    maxContext: k(1_000_000),
    gatewayIds: ["muse-spark-1.3", "meta/muse-spark-1.3"],
    curated: true,
  },
];

export const PROVIDER_COLORS: Record<ProviderId, string> = {
  anthropic: "#d4a27f",
  cursor: "#8eb4ff",
  google: "#8ab4f8",
  zai: "#3ce6c8",
  openai: "#5ee0a0",
  moonshot: "#c9a0ff",
  meta: "#66b3ff",
  xai: "#e8e8e8",
  openrouter: "#9ad4c8",
  other: "#8aa3a0",
};

export const PROVIDER_LABELS: Record<ProviderId, { tr: string; en: string }> = {
  anthropic: { tr: "Anthropic", en: "Anthropic" },
  cursor: { tr: "Cursor", en: "Cursor" },
  google: { tr: "Google", en: "Google" },
  zai: { tr: "Z.ai", en: "Z.ai" },
  openai: { tr: "OpenAI", en: "OpenAI" },
  moonshot: { tr: "Moonshot", en: "Moonshot" },
  meta: { tr: "Meta", en: "Meta" },
  xai: { tr: "xAI", en: "xAI" },
  openrouter: { tr: "OpenRouter", en: "OpenRouter" },
  other: { tr: "Diğer", en: "Other" },
};

export function guessProvider(modelId: string): ProviderId {
  const id = modelId.toLowerCase();
  if (id.includes("claude") || id.startsWith("anthropic/")) return "anthropic";
  if (id.includes("composer") || id.startsWith("cursor/")) return "cursor";
  if (id.includes("gemini") || id.startsWith("google/")) return "google";
  if (id.includes("glm") || id.startsWith("z-ai/") || id.startsWith("zai/")) return "zai";
  if (
    id.includes("gpt") ||
    id.startsWith("o3") ||
    id.startsWith("o4") ||
    id.includes("chat-latest") ||
    id.startsWith("openai/")
  ) {
    return "openai";
  }
  if (id.includes("kimi") || id.startsWith("moonshot")) return "moonshot";
  if (id.includes("muse") || id.includes("llama") || id.startsWith("meta")) return "meta";
  if (id.includes("grok") || id.startsWith("x-ai/")) return "xai";
  if (id.includes("/")) return "openrouter";
  return "other";
}

export function prettyModelName(id: string): string {
  const leaf = id.split("/").pop() ?? id;
  return leaf
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Gpt /g, "GPT-")
    .replace(/Glm /g, "GLM ")
    .replace(/Claude /g, "Claude ");
}

export function isGeminiImageModel(gatewayId: string | null | undefined): boolean {
  if (!gatewayId) return false;
  return /gemini/i.test(gatewayId) && /image/i.test(gatewayId);
}

function matchKeys(model: CatalogModel): Set<string> {
  return new Set(
    [model.id, ...model.gatewayIds, ...(model.aliases ?? [])].map((s) => s.toLowerCase()),
  );
}

export interface LiveEntry {
  id: string;
  provider: string;
}

export function mergePool(live: LiveEntry[]): PoolModel[] {
  const liveById = new Map<string, LiveEntry>();
  for (const entry of live) {
    liveById.set(entry.id.toLowerCase(), entry);
  }

  const claimed = new Set<string>();
  const merged: PoolModel[] = CURATED_MODELS.map((model) => {
    const keys = matchKeys(model);
    let hit: LiveEntry | undefined;
    let resolved: string | null = null;

    for (const gatewayId of model.gatewayIds) {
      const found = liveById.get(gatewayId.toLowerCase());
      if (found) {
        hit = found;
        resolved = gatewayId;
        break;
      }
    }

    if (!hit) {
      for (const key of keys) {
        const found = liveById.get(key);
        if (found) {
          hit = found;
          resolved = found.id;
          break;
        }
      }
    }

    if (hit) claimed.add(hit.id.toLowerCase());

    return {
      ...model,
      available: Boolean(hit && resolved),
      source: hit ? "merged" : "curated",
      isNew: false,
      resolvedGatewayId: hit ? resolved : null,
      liveProvider: hit?.provider,
    };
  });

  for (const entry of live) {
    if (claimed.has(entry.id.toLowerCase())) continue;
    const provider = guessProvider(entry.id);
    const imageCapable = isGeminiImageModel(entry.id);
    merged.push({
      id: entry.id,
      provider,
      displayName: prettyModelName(entry.id),
      defaultContext: null,
      maxContext: null,
      gatewayIds: [entry.id],
      curated: false,
      imageCapable,
      capabilities: imageCapable ? ["chat", "image"] : ["chat"],
      available: true,
      source: "live",
      isNew: true,
      resolvedGatewayId: entry.id,
      liveProvider: entry.provider,
    });
  }

  const order: ProviderId[] = [
    "anthropic",
    "cursor",
    "google",
    "zai",
    "openai",
    "moonshot",
    "meta",
    "xai",
    "openrouter",
    "other",
  ];

  merged.sort((a, b) => {
    const curatedDelta = Number(b.curated) - Number(a.curated);
    if (curatedDelta) return curatedDelta;
    const providerDelta = order.indexOf(a.provider) - order.indexOf(b.provider);
    if (providerDelta) return providerDelta;
    return a.displayName.localeCompare(b.displayName);
  });

  return merged;
}

export function formatContext(tokens: ContextTokens): string {
  if (tokens == null) return "—";
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return String(tokens);
}
