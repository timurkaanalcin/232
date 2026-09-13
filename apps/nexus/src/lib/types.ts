export type Transport = "anthropic" | "openai" | "gemini" | "openrouter" | "unavailable";

export type VendorKey =
  | "anthropic"
  | "openai"
  | "google"
  | "xai"
  | "moonshot"
  | "zai"
  | "cursor"
  | "meta"
  | "deepseek"
  | "mistral"
  | "qwen"
  | "other";

export type FeaturedSeed = {
  key: string;
  name: string;
  vendor: VendorKey;
  vendorLabel: string;
  standardContext: number | null;
  maxContext: number | null;
  candidates: string[];
  description: {
    tr: string;
    en: string;
  };
  kind?: "chat" | "image" | "code";
  fast?: boolean;
};

export type LiveProviderMap = Record<
  string,
  {
    token_env_var?: string;
    url_env_var?: string;
    models: string[] | Record<string, { pricing?: { input?: number; output?: number } }>;
  }
>;

export type PoolModel = {
  id: string;
  key: string;
  name: string;
  vendor: VendorKey;
  vendorLabel: string;
  provider: string;
  transport: Transport;
  apiModel: string;
  standardContext: number | null;
  maxContext: number | null;
  featured: boolean;
  live: boolean;
  isNew: boolean;
  isImage: boolean;
  isCode: boolean;
  fast: boolean;
  description: { tr: string; en: string };
  pricing?: { input?: number; output?: number };
};

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Exclude<ChatRole, "system">;
  content: string;
  modelId?: string;
  modelName?: string;
  pickReason?: string;
  createdAt: number;
  pending?: boolean;
  error?: string;
  images?: { mimeType: string; dataUrl: string }[];
};

export type Conversation = {
  id: string;
  title: string;
  modelId: string;
  compareIds: string[];
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type CatalogResponse = {
  fetchedAt: string;
  source: "live" | "seed";
  featured: PoolModel[];
  models: PoolModel[];
  providers: string[];
  newCount: number;
  liveCount: number;
  gatewayReady: boolean;
};
