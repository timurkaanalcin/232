import type { Config } from "@netlify/functions";
import { findModel } from "../../src/lib/catalog";
import { engineReady, streamLocal } from "../../src/lib/local-engine";
import { isPoolId, pickBestModel } from "../../src/lib/pick";
import { loadCatalog } from "./_shared/catalog";
import type { IncomingMessage } from "../../src/lib/types";

const MAX_MESSAGES = 48;
const MAX_CHARS = 24_000;

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors() });
  }

  let body: { modelId?: string; messages?: IncomingMessage[]; system?: string };
  try {
    body = (await req.json()) as { modelId?: string; messages?: IncomingMessage[]; system?: string };
  } catch {
    return Response.json({ error: "Geçersiz JSON" }, { status: 400, headers: cors() });
  }

  const catalog = await loadCatalog();
  const lastUser = [...(body.messages ?? [])].reverse().find((message) => message.role === "user")?.content ?? "";
  const picked = isPoolId(body.modelId) ? pickBestModel(catalog.models, lastUser) : undefined;
  const model = picked?.model ?? (body.modelId ? findModel(catalog.models, body.modelId) : catalog.models[0]);
  if (!model) {
    return Response.json({ error: "Model bulunamadı" }, { status: 404, headers: cors() });
  }

  const incoming = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  if (!incoming.some((message) => message.role === "user" && message.content.trim())) {
    return Response.json({ error: "Mesaj gerekli" }, { status: 400, headers: cors() });
  }

  const messages: IncomingMessage[] = [];
  if (body.system?.trim()) {
    messages.push({ role: "system", content: body.system.slice(0, MAX_CHARS) });
  }
  for (const message of incoming) {
    if (message.role !== "user" && message.role !== "assistant") continue;
    messages.push({
      role: message.role,
      content: String(message.content ?? "").slice(0, MAX_CHARS),
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      try {
        if (picked) {
          send({
            picked: {
              id: model.id,
              name: model.name,
              reason: picked.reason,
              task: picked.task,
              score: picked.score,
            },
          });
        }
        if (!(await engineReady())) {
          send({
            delta:
              "Yerel GGUF motoru henüz açılmadı. `npm run llama` çalıştırın — bulut yok, Dolphin 3 uncensored yerelde kalkar.",
          });
          send({ done: true });
          controller.close();
          return;
        }
        await streamLocal({
          key: model.key,
          name: model.name,
          messages,
          onText: (text) => send({ delta: text }),
        });
        send({ done: true });
        controller.close();
      } catch {
        send({
          delta:
            "Motor kısa süre meşguldü. Aynı soruyu tekrar gönder — bu havuz buluta düşmez, yerel GGUF yeniden dener.",
        });
        send({ done: true });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...cors(),
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

export const config: Config = {
  path: "/api/chat",
  method: ["POST", "OPTIONS"],
};
