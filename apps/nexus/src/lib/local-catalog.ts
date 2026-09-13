import { FEATURED_SEEDS } from "./featured";
import type { PoolModel } from "./types";

export function buildLocalCatalog(): PoolModel[] {
  return FEATURED_SEEDS.map((seed) => ({
    id: `featured:${seed.key}`,
    key: seed.key,
    name: seed.name,
    vendor: seed.vendor,
    vendorLabel: seed.vendorLabel,
    provider: "gguf",
    transport: "openai",
    apiModel: seed.key,
    standardContext: seed.standardContext,
    maxContext: seed.maxContext,
    featured: true,
    live: true,
    isNew: false,
    isImage: seed.kind === "image",
    isCode: seed.kind === "code",
    fast: Boolean(seed.fast),
    description: {
      tr: `${seed.description.tr} Yerel GGUF (Dolphin 3 uncensored) — bulut yok.`,
      en: `${seed.description.en} Local GGUF (Dolphin 3 uncensored) — no cloud.`,
    },
  }));
}
