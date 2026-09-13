import type { Config } from "@netlify/functions";
import { findModel } from "../../src/lib/catalog";
import { isPoolId, pickBestModel } from "../../src/lib/pick";
import { loadCatalog } from "./_shared/catalog";
import { gatewayReady } from "./_shared/env";
import { streamModel, type IncomingMessage } from "./_shared/router";

const MAX_MESSAGES = 32;
const MAX_CHARS = 16_000;
const buckets = new Map<string, { count: number; reset: number }>();

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors() });
  }

  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for") ?? "local";
  if (!allow(ip)) {
    return Response.json({ error: "Çok fazla istek. Bir dakika bekleyin." }, { status: 429, headers: cors() });
  }

  let body: { modelId?: string; messages?: IncomingMessage[]; system?: string };
  try {
    body = (await req.json()) as { modelId?: string; messages?: IncomingMessage[]; system?: string };
  } catch {
    return Response.json({ error: "Geçersiz JSON" }, { status: 400, headers: cors() });
  }

  const catalog = await loadCatalog();
  const lastUser = [...(body.messages ?? [])].reverse().find((message) => message.role === "user")?.content ?? "";
  const picked = isPoolId(body.modelId)
    ? pickBestModel(catalog.models, lastUser)
    : undefined;
  const model = picked?.model ?? (body.modelId ? findModel(catalog.models, body.modelId) : undefined);
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
  messages.push({
    role: "system",
    content: `You are chatting as ${model.name} inside Nexus, a multi-model pool. Be useful, concise when asked, and match the user's language.`,
  });
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
        if (!gatewayReady()) {
          await demoStream(model.name, messages, (text) => send({ delta: text }), picked?.reason.tr);
          send({ done: true, demo: true });
          controller.close();
          return;
        }
        await streamModel(model, messages, {
          onText: (text) => send({ delta: text }),
          onImage: (image) => send({ image }),
        });
        send({ done: true });
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Model yanıt veremedi";
        send({ error: message });
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

function allow(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip);
  if (!current || now > current.reset) {
    buckets.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (current.count >= 40) return false;
  current.count += 1;
  return true;
}

async function demoStream(
  name: string,
  messages: IncomingMessage[],
  onText: (text: string) => void,
  reason?: string,
) {
  const last = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const text =
    `Havuz seçimi: **${name}**\n\n` +
    `${reason ?? "Bu soruda en yüksek doğruluk potansiyeline sahip model."}\n\n` +
    `Yerel önizlemedesin — Netlify production + AI Features sonrası ${name} gerçek yanıtı üretir.\n\n` +
    `> ${last.slice(0, 280) || "Merhaba"}`;
  for (const piece of text.match(/.{1,24}/gs) ?? [text]) {
    onText(piece);
    await new Promise((resolve) => setTimeout(resolve, 12));
  }
}

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
