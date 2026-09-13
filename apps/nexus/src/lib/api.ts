import type { CatalogResponse } from "./types";

export async function fetchCatalog(refresh = false): Promise<CatalogResponse> {
  const response = await fetch(`/api/models${refresh ? "?refresh=1" : ""}`);
  if (!response.ok) {
    throw new Error("catalog");
  }
  return response.json();
}

export async function streamChat(input: {
  modelId: string;
  messages: { role: "user" | "assistant"; content: string }[];
  system?: string;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onImage?: (image: { mimeType: string; data: string }) => void;
}): Promise<{ demo?: boolean }> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: input.signal,
    body: JSON.stringify({
      modelId: input.modelId,
      messages: input.messages,
      system: input.system,
    }),
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({ error: "chat failed" }));
    throw new Error(payload.error ?? "chat failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let demo = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.replace(/^data:\s*/, "").trim();
      if (!line) continue;
      const event = JSON.parse(line) as {
        delta?: string;
        image?: { mimeType: string; data: string };
        error?: string;
        demo?: boolean;
        done?: boolean;
      };
      if (event.error) throw new Error(event.error);
      if (event.delta) input.onDelta(event.delta);
      if (event.image) input.onImage?.(event.image);
      if (event.demo) demo = true;
    }
  }

  return { demo };
}
