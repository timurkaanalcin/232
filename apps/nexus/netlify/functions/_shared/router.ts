import { streamLocal } from "../../../src/lib/local-engine";
import type { IncomingMessage, PoolModel } from "../../../src/lib/types";

export type { IncomingMessage };

export type StreamHandlers = {
  onText: (chunk: string) => void;
  onImage?: (image: { mimeType: string; data: string }) => void;
};

export async function streamModel(model: PoolModel, messages: IncomingMessage[], handlers: StreamHandlers) {
  await streamLocal({
    key: model.key,
    name: model.name,
    messages,
    onText: handlers.onText,
  });
}
