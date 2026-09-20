import type { Locale } from "./i18n";
import type { PoolModel } from "./types";

export const POOL_ID = "pool:auto";

export type TaskKind = "accuracy" | "code" | "image" | "math" | "long";

export type PickResult = {
  model: PoolModel;
  task: TaskKind;
  score: number;
  reason: { tr: string; en: string };
};

const ACCURACY: Record<string, number> = {
  "claude-opus-5": 100,
  "claude-opus-4.8": 96,
  "gpt-5.6-sol": 95,
  "gpt-5.5": 93,
  "claude-fable-5.1": 92,
  "gemini-3.1-pro": 91,
  "claude-4.7-opus": 90,
  "claude-opus-4.7-fast": 84,
  "gpt-5.6-terra": 88,
  "claude-sonnet-5": 87,
  "claude-4.6-opus": 86,
  "gpt-5.4": 85,
  "grok-4.6": 84,
  "kimi-k3": 83,
  "gemini-3-pro": 82,
  "claude-fable-5": 82,
  "claude-4.5-opus": 80,
  "gpt-5.2": 78,
  "gpt-5": 74,
  "claude-4.6-sonnet": 76,
  "claude-4.5-sonnet": 74,
  "glm-5.2": 72,
  "muse-spark-1.3": 70,
  "gpt-5.3-codex": 68,
  "kimi-k2.7-code": 67,
  "composer-2.5": 66,
  "gpt-5.1-codex-max": 65,
  "gpt-5.2-codex": 64,
  "gpt-5-codex": 62,
  "gemini-3.8-flash": 58,
  "gemini-3.7-flash": 56,
  "gpt-5.6-luna": 55,
  "gemini-3.5-flash": 54,
  "claude-4.5-haiku": 48,
  "gpt-5.4-mini": 46,
  "gpt-5-mini": 42,
  "gpt-5.4-nano": 36,
};

export function classifyPrompt(prompt: string): TaskKind {
  const text = prompt.toLowerCase();
  if (/(görsel üret|resim çiz|resmi üret|yağlıboya|image of|generate an image|logo çiz|görsel yap|dall-e|text-to-image)/i.test(text)) {
    return "image";
  }
  if (
    /(```|function\s|def\s|class\s|refactor|typescript|javascript|python|bugfix|compile|stack trace|kod yaz|yazılım|algorithm)/i.test(
      text,
    )
  ) {
    return "code";
  }
  if (prompt.length > 6000) return "long";
  if (/(türev|integral|ispat|theorem|probability|kaç eder|hesapla|denklem|math\b|proof\b)/i.test(text)) {
    return "math";
  }
  return "accuracy";
}

export function scoreModel(model: PoolModel, task: TaskKind): number {
  if (!model.live || model.transport === "unavailable") return -1;
  if (model.id === POOL_ID || model.key === "pool") return -1;

  let score = ACCURACY[model.key] ?? heuristicScore(model);

  if (task === "image") {
    return model.isImage ? score + 80 : -1;
  }
  if (model.isImage) return -1;

  if (task === "code" && model.isCode) score += 22;
  if (task === "code" && /opus|sol|sonnet-5|gpt-5\.[456]/i.test(model.key)) score += 8;
  if (task === "math" && /opus|sol|pro|fable/i.test(model.key)) score += 6;
  if (task === "long" && (model.maxContext ?? 0) >= 1_000_000) score += 10;
  if (model.fast && task === "accuracy") score -= 8;
  return score;
}

function heuristicScore(model: PoolModel): number {
  let score = 40;
  if (/opus-5|opus 5/i.test(model.apiModel)) score = 99;
  else if (/opus-4-8|opus 4\.8/i.test(model.apiModel)) score = 95;
  else if (/sol|gpt-5\.5|fable-5-1/i.test(model.apiModel)) score = 93;
  else if (/opus/i.test(model.apiModel)) score = 86;
  else if (/sonnet-5|gpt-5\.4|grok-4\.6|kimi-k3/i.test(model.apiModel)) score = 82;
  else if (/pro/i.test(model.apiModel)) score = 80;
  else if (/codex|code/i.test(model.apiModel)) score = 64;
  else if (/flash|mini|nano|haiku|lite|fast/i.test(model.apiModel)) score = 46;
  if (model.featured) score += 2;
  return score;
}

const REASONS: Record<TaskKind, { tr: string; en: string }> = {
  accuracy: {
    tr: "Bu soruda en yüksek doğruluk potansiyeline sahip model.",
    en: "Highest correctness potential for this question.",
  },
  code: {
    tr: "Kod / mühendislik sorusu — en güçlü kod-muhakeme modeli seçildi.",
    en: "Engineering question — strongest code-reasoning model selected.",
  },
  image: {
    tr: "Görsel istek — havuzdaki en iyi görsel modeli seçildi.",
    en: "Image request — best live image model selected.",
  },
  math: {
    tr: "Sayısal / ispat sorusu — en güçlü muhakeme modeli seçildi.",
    en: "Math / proof question — strongest reasoning model selected.",
  },
  long: {
    tr: "Uzun bağlam — 1M pencereli en güçlü model seçildi.",
    en: "Long context — strongest 1M-window model selected.",
  },
};

export function pickBestModel(models: PoolModel[], prompt: string): PickResult | null {
  const task = classifyPrompt(prompt);
  let best: PickResult | null = null;
  for (const model of models) {
    const score = scoreModel(model, task);
    if (score < 0) continue;
    if (!best || score > best.score) {
      best = { model, task, score, reason: REASONS[task] };
    }
  }
  return best;
}

export function poolModel(locale: Locale = "tr"): PoolModel {
  return {
    id: POOL_ID,
    key: "pool",
    name: locale === "tr" ? "Havuz" : "Pool",
    vendor: "other",
    vendorLabel: "Nexus",
    provider: "pool",
    transport: "openai",
    apiModel: "auto",
    standardContext: 300_000,
    maxContext: 1_000_000,
    featured: true,
    live: true,
    isNew: false,
    isImage: false,
    isCode: false,
    fast: false,
    description: {
      tr: "Soruyu havuza sor. En doğru cevap potansiyeline sahip canlı model yanıtlar.",
      en: "Ask the pool. The live model with the highest correctness potential answers.",
    },
  };
}

export function isPoolId(id?: string | null): boolean {
  return !id || id === POOL_ID || id === "pool" || id === "auto";
}
