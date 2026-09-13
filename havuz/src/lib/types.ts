export type ProviderId =
  | "anthropic"
  | "cursor"
  | "google"
  | "zai"
  | "openai"
  | "moonshot"
  | "meta"
  | "xai"
  | "openrouter"
  | "other";

export type ContextTokens = number | null;

export type ChatRole = "system" | "user" | "assistant";

export interface CatalogModel {
  id: string;
  provider: ProviderId;
  displayName: string;
  defaultContext: ContextTokens;
  maxContext: ContextTokens;
  /** IDs the Netlify AI Gateway actually accepts for this row. */
  gatewayIds: string[];
  /** Extra IDs used when matching the live catalog. */
  aliases?: string[];
  curated: boolean;
  imageCapable?: boolean;
  capabilities?: Array<"chat" | "image" | "code">;
}

export interface PoolModel extends CatalogModel {
  available: boolean;
  source: "curated" | "live" | "merged";
  isNew: boolean;
  resolvedGatewayId: string | null;
  liveProvider?: string;
}

export interface ModelsResponse {
  models: PoolModel[];
  fetchedAt: string;
  cacheTtlMs: number;
  gatewayReady: boolean;
  liveCount: number;
  newCount: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: Exclude<ChatRole, "system">;
  content: string;
  createdAt: number;
  modelId?: string;
  imageUrl?: string;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AppSettings {
  locale: "tr" | "en";
  systemPrompt: string;
  temperature: number;
  defaultModelId: string;
  /** Netlify site origin for packaged clients, e.g. https://havuz.netlify.app */
  apiBase: string;
}
