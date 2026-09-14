import { enrichLocalModels } from "./local-studio";
import type { ModelsResponse, PoolModel } from "./types";

export const LM_STUDIO_ORIGIN = "http://127.0.0.1:1234";

export function isLocalOpenAI(base: string): boolean {
  const normalized = base.trim().replace(/\/$/, "");
  if (!normalized) return false;
  try {
    const url = new URL(normalized);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return /localhost|127\.0\.0\.1/.test(normalized);
  }
}

function prettyName(id: string): string {
  const leaf = id.split("/").pop() ?? id;
  return leaf.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchLocalModels(base: string): Promise<ModelsResponse> {
  const origin = base.replace(/\/$/, "");
  const res = await fetch(`${origin}/v1/models`);
  if (!res.ok) {
    throw new Error(`LM Studio /v1/models HTTP ${res.status}`);
  }
  const body = (await res.json()) as { data?: Array<{ id: string }> };
  const models: PoolModel[] = enrichLocalModels(
    (body.data ?? []).map((row) => ({
      id: row.id,
      provider: "local",
      displayName: prettyName(row.id),
      defaultContext: null,
      maxContext: null,
      gatewayIds: [row.id],
      curated: false,
      available: true,
      source: "live",
      isNew: false,
      resolvedGatewayId: row.id,
      liveProvider: "lmstudio",
    })),
  );
  return {
    models,
    fetchedAt: new Date().toISOString(),
    cacheTtlMs: 15_000,
    gatewayReady: models.length > 0,
    liveCount: models.length,
    newCount: 0,
  };
}

export async function streamLocalChat(
  base: string,
  payload: {
    modelId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    systemPrompt?: string;
    temperature?: number;
  },
  handlers: {
    onDelta: (text: string) => void;
    onError: (message: string, code?: string) => void;
    onDone: () => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  const origin = base.replace(/\/$/, "");
  const messages: Array<{ role: string; content: string }> = [];
  if (payload.systemPrompt?.trim()) {
    messages.push({ role: "system", content: payload.systemPrompt.trim() });
  }
  messages.push(...payload.messages);
  const res = await fetch(`${origin}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: payload.modelId,
      messages,
      temperature: payload.temperature,
      stream: true,
    }),
    signal: handlers.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    handlers.onError(text || `LM Studio HTTP ${res.status}`);
    return;
  }
  if (!res.body) {
    handlers.onError("LM Studio akış gövdesi boş.");
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") {
        handlers.onDone();
        return;
      }
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string | null } }>;
        };
        const chunk = json.choices?.[0]?.delta?.content;
        if (chunk) handlers.onDelta(chunk);
      } catch {
        /* ignore malformed SSE */
      }
    }
  }
  handlers.onDone();
}
