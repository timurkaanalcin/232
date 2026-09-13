import type { IncomingMessage } from "./types";
import { slotProfile } from "./personas";

export const LOCAL_LLM_URL = process.env.NEXUS_LLM_URL ?? "http://127.0.0.1:8088";

export async function engineReady(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_LLM_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function streamLocal(input: {
  key: string;
  name: string;
  messages: IncomingMessage[];
  onText: (text: string) => void;
}) {
  const slot = slotProfile(input.key, input.name);
  const messages = [
    { role: "system" as const, content: slot.system },
    ...input.messages.filter((message) => message.role !== "system" || Boolean(message.content.trim())),
  ];

  const response = await fetch(`${LOCAL_LLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: input.key,
      stream: true,
      temperature: slot.temperature,
      top_p: slot.topP,
      max_tokens: slot.maxTokens,
      messages,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `local engine ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const trimmed = line.replace(/^data:\s*/, "").trim();
      if (!trimmed || trimmed === "[DONE]") continue;
      try {
        const json = JSON.parse(trimmed) as { choices?: { delta?: { content?: string } }[] };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) input.onText(delta);
      } catch {
        // ignore keep-alives
      }
    }
  }
}
