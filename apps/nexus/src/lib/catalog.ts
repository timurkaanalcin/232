import { FEATURED_SEEDS } from "./featured";
import type { FeaturedSeed, LiveProviderMap, PoolModel, Transport, VendorKey } from "./types";

export const GATEWAY_PROVIDERS_URL = "https://api.netlify.com/api/v1/ai-gateway/providers/detailed";

const VENDOR_LABELS: Record<string, { vendor: VendorKey; label: string }> = {
  anthropic: { vendor: "anthropic", label: "Anthropic" },
  openai: { vendor: "openai", label: "OpenAI" },
  gemini: { vendor: "google", label: "Google" },
  google: { vendor: "google", label: "Google" },
  "x-ai": { vendor: "xai", label: "xAI" },
  xai: { vendor: "xai", label: "xAI" },
  moonshotai: { vendor: "moonshot", label: "Moonshot" },
  moonshot: { vendor: "moonshot", label: "Moonshot" },
  "z-ai": { vendor: "zai", label: "Z.ai" },
  zai: { vendor: "zai", label: "Z.ai" },
  cursor: { vendor: "cursor", label: "Cursor" },
  meta: { vendor: "meta", label: "Meta" },
  "meta-llama": { vendor: "meta", label: "Meta" },
  deepseek: { vendor: "deepseek", label: "DeepSeek" },
  mistralai: { vendor: "mistral", label: "Mistral" },
  qwen: { vendor: "qwen", label: "Qwen" },
};

export type LiveEntry = {
  provider: string;
  apiModel: string;
  pricing?: { input?: number; output?: number };
};

export function flattenLiveProviders(raw: LiveProviderMap): Map<string, LiveEntry> {
  const map = new Map<string, LiveEntry>();
  for (const [provider, data] of Object.entries(raw ?? {})) {
    const models = data?.models;
    if (!models) continue;
    const ids = Array.isArray(models) ? models : Object.keys(models);
    for (const apiModel of ids) {
      const pricing = Array.isArray(models) ? undefined : models[apiModel]?.pricing;
      map.set(apiModel, { provider, apiModel, pricing });
      if (!apiModel.includes("/")) {
        map.set(`${provider}/${apiModel}`, { provider, apiModel, pricing });
      }
    }
  }
  return map;
}

export function resolveTransport(provider: string, live: boolean): Transport {
  if (!live) return "unavailable";
  if (provider === "anthropic") return "anthropic";
  if (provider === "openai") return "openai";
  if (provider === "gemini" || provider === "google") return "gemini";
  return "openrouter";
}

export function inferVendor(provider: string, apiModel: string): { vendor: VendorKey; label: string } {
  const prefix = apiModel.includes("/") ? apiModel.split("/")[0] : provider;
  return VENDOR_LABELS[prefix] ?? VENDOR_LABELS[provider] ?? { vendor: "other", label: titleCase(provider) };
}

export function prettyModelName(apiModel: string): string {
  const bare = apiModel.replace(/^~/, "").split("/").pop() ?? apiModel;
  return bare
    .replace(/-/g, " ")
    .replace(/\bai\b/gi, "AI")
    .replace(/\bgpt\b/gi, "GPT")
    .replace(/\bglm\b/gi, "GLM")
    .replace(/\b(\d+)\s+(\d+)\b/g, "$1.$2")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function titleCase(value: string): string {
  return value.replace(/(^|[-_/])(\w)/g, (_, sep: string, ch: string) => (sep ? ` ${ch.toUpperCase()}` : ch.toUpperCase()));
}

function isImageModel(apiModel: string, kind?: FeaturedSeed["kind"]): boolean {
  if (kind === "image") return true;
  return /image|dall-e|sunburst|flare/i.test(apiModel);
}

function isCodeModel(apiModel: string, kind?: FeaturedSeed["kind"]): boolean {
  if (kind === "code") return true;
  return /codex|composer|code\b/i.test(apiModel);
}

export function pickLiveCandidate(candidates: string[], live: Map<string, LiveEntry>): LiveEntry | undefined {
  for (const candidate of candidates) {
    const hit = live.get(candidate);
    if (hit) return hit;
  }
  return undefined;
}

export function buildCatalog(raw: LiveProviderMap | null): PoolModel[] {
  const live = flattenLiveProviders(raw ?? {});
  const claimed = new Set<string>();
  const featured: PoolModel[] = FEATURED_SEEDS.map((seed) => {
    const hit = pickLiveCandidate(seed.candidates, live);
    if (hit) claimed.add(hit.apiModel);
    const apiModel = hit?.apiModel ?? seed.candidates[0] ?? seed.key;
    const provider = hit?.provider ?? seed.vendor;
    const liveNow = Boolean(hit);
    return {
      id: `featured:${seed.key}`,
      key: seed.key,
      name: seed.name,
      vendor: seed.vendor,
      vendorLabel: seed.vendorLabel,
      provider,
      transport: resolveTransport(provider, liveNow),
      apiModel,
      standardContext: seed.standardContext,
      maxContext: seed.maxContext,
      featured: true,
      live: liveNow,
      isNew: false,
      isImage: isImageModel(apiModel, seed.kind),
      isCode: isCodeModel(apiModel, seed.kind),
      fast: Boolean(seed.fast),
      description: seed.description,
      pricing: hit?.pricing,
    };
  });

  const discovered: PoolModel[] = [];
  for (const entry of live.values()) {
    if (claimed.has(entry.apiModel)) continue;
    claimed.add(entry.apiModel);
    const { vendor, label } = inferVendor(entry.provider, entry.apiModel);
    discovered.push({
      id: `live:${entry.provider}:${entry.apiModel}`,
      key: entry.apiModel,
      name: prettyModelName(entry.apiModel),
      vendor,
      vendorLabel: label,
      provider: entry.provider,
      transport: resolveTransport(entry.provider, true),
      apiModel: entry.apiModel,
      standardContext: null,
      maxContext: null,
      featured: false,
      live: true,
      isNew: /^~|latest|preview/i.test(entry.apiModel),
      isImage: isImageModel(entry.apiModel),
      isCode: isCodeModel(entry.apiModel),
      fast: /flash|mini|nano|fast|lite|haiku|luna/i.test(entry.apiModel),
      description: {
        tr: "Canlı Netlify AI Gateway kataloğundan yeni geldi.",
        en: "Just arrived from the live Netlify AI Gateway catalog.",
      },
      pricing: entry.pricing,
    });
  }

  discovered.sort((a, b) => a.vendorLabel.localeCompare(b.vendorLabel) || a.name.localeCompare(b.name));
  return [...featured, ...discovered];
}

export function findModel(models: PoolModel[], id: string): PoolModel | undefined {
  return models.find((model) => model.id === id || model.key === id || model.apiModel === id);
}

export function formatContext(tokens: number | null): string | null {
  if (!tokens) return null;
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return String(tokens);
}
