import catalog from "./local-studio.json";
import type { PoolModel } from "./types";

export type LocalKind = "chat" | "embed" | "stt";
export type LocalWave = 1 | 2 | 3 | "extra" | "never";

export interface LocalGet {
  repo: string;
  flags?: string[];
  quant?: string;
}

export interface LocalModel {
  id: string;
  wave: LocalWave;
  kind: LocalKind;
  banned: boolean;
  priority: number;
  displayName: string;
  sizeGb: number;
  sizeNote?: string;
  format: string;
  strength: string;
  limit: string;
  verdict: string;
  card: string;
  ggufCard?: string;
  lms?: string;
  preset: string;
  temperature: number;
  ctx: number;
  vision: boolean;
  gets: LocalGet[];
  loadNeedles: string[];
  identifier: string;
  match: string[];
  matchExclude?: string[];
}

export interface LocalStudioCatalog {
  machine: { chip: string; unifiedGb: number; osReserveGb: number; rule: string };
  defaults: { ctx: number; gpu: string; temperature: number; port: number };
  trialOrder: string[];
  baselineId: string;
  notes: { imageGen: string; mlx8bit27b: string; compare: string };
  models: LocalModel[];
}

export const LOCAL_STUDIO = catalog as LocalStudioCatalog;

export const STUDIO_ROLE_IDS = [
  "claude",
  "baseline",
  "fusion",
  "turkish",
  "fast",
  "qwopus",
  "teichai",
  "coder",
  "reason",
] as const;

export function localModelById(id: string): LocalModel | undefined {
  return LOCAL_STUDIO.models.find((m) => m.id === id);
}

export function downloadableModels(wave: LocalWave | "all" = 1): LocalModel[] {
  return LOCAL_STUDIO.models.filter((m) => {
    if (m.banned || m.gets.length === 0) return false;
    if (wave === "all") return m.wave !== "never";
    return m.wave === wave;
  });
}

function haystack(id: string): string {
  return id.toLowerCase();
}

export function matchLocalModel(modelId: string): LocalModel | undefined {
  const id = haystack(modelId);
  const hits = LOCAL_STUDIO.models
    .filter((m) => {
      if (m.matchExclude?.some((ex) => id.includes(ex.toLowerCase()))) return false;
      return m.match.some((key) => id.includes(key.toLowerCase()));
    })
    .sort((a, b) => {
      const al = Math.max(...a.match.map((k) => k.length));
      const bl = Math.max(...b.match.map((k) => k.length));
      return bl - al;
    });
  return hits[0];
}

export function isNonChatLocal(model: PoolModel | undefined): boolean {
  if (!model) return false;
  const caps = model.capabilities ?? [];
  if (caps.includes("embed") || caps.includes("stt")) return !caps.includes("chat");
  const hit = matchLocalModel(model.id);
  return Boolean(hit && hit.kind !== "chat");
}

export function enrichLocalModels(models: PoolModel[]): PoolModel[] {
  const enriched = models.map((model) => {
    const hit = matchLocalModel(model.id);
    if (!hit || hit.banned) return model;
    const capabilities: NonNullable<PoolModel["capabilities"]> = [];
    if (hit.kind === "chat") capabilities.push("chat");
    if (hit.kind === "embed") capabilities.push("embed");
    if (hit.kind === "stt") capabilities.push("stt");
    if (hit.vision) {
      capabilities.push("vision");
      model = { ...model, imageCapable: true };
    }
    if (hit.preset === "coder" || hit.id === "fusion" || hit.id === "ornith") {
      capabilities.push("code");
    }
    return {
      ...model,
      displayName: hit.displayName,
      defaultContext: hit.ctx || model.defaultContext,
      maxContext: hit.ctx || model.maxContext,
      capabilities: capabilities.length ? capabilities : model.capabilities,
      imageCapable: hit.vision || model.imageCapable,
    };
  });
  return enriched.sort((a, b) => {
    const pa = matchLocalModel(a.id)?.priority ?? 500;
    const pb = matchLocalModel(b.id)?.priority ?? 500;
    if (pa !== pb) return pa - pb;
    return a.displayName.localeCompare(b.displayName);
  });
}

export const STUDIO_QUICK_ROLES = LOCAL_STUDIO.models.filter(
  (m) => !m.banned && m.kind === "chat" && (m.wave === 1 || m.id === "coder" || m.id === "qwopus"),
);
