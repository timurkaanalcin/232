import { apiUrl } from "./api-base";
import type { ModelsResponse } from "./types";

export async function fetchModels(refresh = false): Promise<ModelsResponse> {
  const res = await fetch(apiUrl(`/api/models${refresh ? "?refresh=1" : ""}`));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Models HTTP ${res.status}`);
  }
  return res.json();
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onError: (message: string, code?: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}

export async function streamChat(
  payload: {
    modelId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    systemPrompt?: string;
    temperature?: number;
  },
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch(apiUrl("/api/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    handlers.onError(body.error || `HTTP ${res.status}`, res.status === 429 ? "RATE_LIMIT" : undefined);
    return;
  }

  if (!res.body) {
    handlers.onError("Akış gövdesi boş.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const block of parts) {
      const event = /(?:^|\n)event: (\w+)/.exec(block)?.[1];
      const dataLine = block
        .split("\n")
        .filter((l) => l.startsWith("data: "))
        .map((l) => l.slice(6))
        .join("");
      if (!event || !dataLine) continue;
      try {
        const data = JSON.parse(dataLine) as { text?: string; message?: string; code?: string };
        if (event === "delta" && data.text) handlers.onDelta(data.text);
        if (event === "error") handlers.onError(data.message || "Model hatası", data.code);
        if (event === "done") handlers.onDone();
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
}
