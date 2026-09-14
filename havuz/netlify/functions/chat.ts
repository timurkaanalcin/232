import type { Config, Context } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { getStore } from "@netlify/blobs";
import OpenAI from "openai";
import { CURATED_MODELS, isGeminiImageModel } from "../../src/lib/catalog";
import { gatewaySecrets, isGatewayReady } from "./_shared/env";
import { loadPool } from "./_shared/live-models";
import { clientIp, limitChat } from "./_shared/rate-limit";
import { corsOptions, jsonError, sseChunk, sseHeaders } from "./_shared/sse";

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatBody {
  modelId?: string;
  messages?: IncomingMessage[];
  systemPrompt?: string;
  temperature?: number;
}

function encoder() {
  return new TextEncoder();
}

function resolveModel(modelId: string, pool: Awaited<ReturnType<typeof loadPool>>) {
  const fromPool = pool.models.find((m) => m.id === modelId || m.resolvedGatewayId === modelId);
  if (fromPool) return fromPool;
  const curated = CURATED_MODELS.find((m) => m.id === modelId);
  if (curated) {
    return {
      ...curated,
      available: false,
      source: "curated" as const,
      isNew: false,
      resolvedGatewayId: curated.gatewayIds[0] ?? null,
    };
  }
  return null;
}

function clampTemp(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Math.min(1, Math.max(0, value));
}

async function streamDemo(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encode: TextEncoder,
  modelLabel: string,
  lastUser: string,
) {
  const text =
    `Havuz yerel önizleme: Netlify AI Gateway henüz bu ortamda etkin değil. ` +
    `Üretim deploy’undan sonra gerçek ${modelLabel} yanıtları akar. ` +
    `İletiniz alındı: “${lastUser.slice(0, 180)}”.`;
  for (const part of text.match(/.{1,24}/g) ?? [text]) {
    controller.enqueue(encode.encode(sseChunk("delta", { text: part })));
    await new Promise((r) => setTimeout(r, 12));
  }
  controller.enqueue(encode.encode(sseChunk("done", { demo: true })));
}

function openaiMessages(systemPrompt: string | undefined, messages: IncomingMessage[]) {
  const out: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (systemPrompt?.trim()) out.push({ role: "system", content: systemPrompt.trim() });
  for (const msg of messages) {
    if (msg.role === "system") continue;
    out.push({ role: msg.role, content: msg.content });
  }
  return out;
}

function anthropicMessages(messages: IncomingMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

function geminiContents(messages: IncomingMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

function providerOf(gatewayId: string, liveProvider?: string): "anthropic" | "gemini" | "openai" | "openrouter" {
  if (liveProvider === "anthropic" || gatewayId.startsWith("claude")) return "anthropic";
  if (liveProvider === "gemini" || gatewayId.startsWith("gemini")) return "gemini";
  if (liveProvider === "openrouter" || gatewayId.includes("/")) return "openrouter";
  return "openai";
}

async function generateGeminiImage(opts: {
  model: string;
  prompt: string;
  secrets: ReturnType<typeof gatewaySecrets>;
}): Promise<{ markdown: string } | { error: string }> {
  const ai = new GoogleGenAI({
    apiKey: opts.secrets.geminiKey,
    httpOptions: opts.secrets.geminiBase ? { baseUrl: opts.secrets.geminiBase } : undefined,
  });
  const response = await ai.models.generateContent({
    model: opts.model,
    contents: opts.prompt,
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  const text = parts.map((p) => p.text).filter(Boolean).join("\n");
  if (!imagePart?.inlineData?.data) {
    return { error: text || "Görsel üretilemedi." };
  }
  const mime = imagePart.inlineData.mimeType || "image/png";
  const bytes = Buffer.from(imagePart.inlineData.data, "base64");
  let url = `data:${mime};base64,${imagePart.inlineData.data}`;
  try {
    const store = getStore({ name: "havuz-images", consistency: "strong" });
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    await store.set(key, new Blob([bytes], { type: mime }), {
      metadata: { contentType: mime },
    });
    url = `/api/image/${key}`;
  } catch {
    // Blobs is optional; data URL still works in the thread.
  }
  const caption = text ? `\n\n${text}` : "";
  return { markdown: `![${opts.prompt.slice(0, 80)}](${url})${caption}` };
}

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") return corsOptions();
  if (req.method !== "POST") return jsonError("Method not allowed", 405);

  const limited = limitChat(clientIp(req));
  if (!limited.ok) {
    return jsonError("İstek limiti aşıldı. Bir dakika sonra yeniden deneyin.", 429, {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return jsonError("Geçersiz JSON gövdesi.", 400);
  }

  const modelId = body.modelId?.trim();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!modelId) return jsonError("modelId gerekli.", 400);
  if (!messages.length) return jsonError("messages gerekli.", 400);

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content?.trim() ?? "";
  if (!lastUser) return jsonError("Kullanıcı iletisi boş.", 400);

  const pool = await loadPool(false);
  const model = resolveModel(modelId, pool);
  if (!model) return jsonError("Model bulunamadı.", 404);

  const gatewayId = model.resolvedGatewayId ?? model.gatewayIds[0] ?? null;
  const temperature = clampTemp(body.temperature);
  const systemPrompt = body.systemPrompt?.slice(0, 8000);
  const secrets = gatewaySecrets();
  const gatewayReady = isGatewayReady();
  const deployContext = context.deploy?.context;
  const isProd = deployContext === "production";
  const encode = encoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encode.encode(sseChunk(event, data)));
      };

      try {
        if (!gatewayReady) {
          if (!isProd) {
            await streamDemo(controller, encode, model.displayName, lastUser);
            controller.close();
            return;
          }
          send("error", {
            message:
              "AI Gateway hazır değil. Siteyi bir kez production’a deploy edin ve Netlify AI özelliklerinin açık olduğundan emin olun.",
            code: "GATEWAY_NOT_READY",
          });
          controller.close();
          return;
        }

        if (!gatewayId || !model.available) {
          send("error", {
            message: `${model.displayName} Netlify AI Gateway’de henüz yok. Katalogda duruyor; yayınlandığında otomatik açılır.`,
            code: "MODEL_UNAVAILABLE",
          });
          controller.close();
          return;
        }

        send("meta", {
          modelId: model.id,
          gatewayId,
          displayName: model.displayName,
        });

        if (isGeminiImageModel(gatewayId) || model.imageCapable) {
          const image = await generateGeminiImage({
            model: gatewayId,
            prompt: lastUser,
            secrets,
          });
          if ("error" in image) {
            send("error", { message: image.error, code: "IMAGE_FAILED" });
          } else {
            send("delta", { text: image.markdown });
            send("done", { image: true });
          }
          controller.close();
          return;
        }

        const kind = providerOf(gatewayId, model.liveProvider);

        if (kind === "anthropic") {
          const client = new Anthropic({
            apiKey: secrets.anthropicKey,
            baseURL: secrets.anthropicBase,
          });
          const streamRes = client.messages.stream({
            model: gatewayId,
            max_tokens: 4096,
            temperature,
            system: systemPrompt || undefined,
            messages: anthropicMessages(messages),
          });
          for await (const event of streamRes) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              send("delta", { text: event.delta.text });
            }
          }
          send("done", {});
          controller.close();
          return;
        }

        if (kind === "gemini") {
          const ai = new GoogleGenAI({
            apiKey: secrets.geminiKey,
            httpOptions: secrets.geminiBase ? { baseUrl: secrets.geminiBase } : undefined,
          });
          const result = await ai.models.generateContentStream({
            model: gatewayId,
            contents: geminiContents(messages),
            config: {
              systemInstruction: systemPrompt || undefined,
              temperature,
            },
          });
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) send("delta", { text });
          }
          send("done", {});
          controller.close();
          return;
        }

        const useRouter = kind === "openrouter";
        const openai = new OpenAI({
          apiKey: useRouter ? secrets.openrouterKey : secrets.openaiKey,
          baseURL: useRouter ? secrets.openrouterBase : secrets.openaiBase,
        });
        const completion = await openai.chat.completions.create({
          model: gatewayId,
          temperature,
          stream: true,
          messages: openaiMessages(systemPrompt, messages),
        });
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) send("delta", { text });
        }
        send("done", {});
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Model yanıtı alınamadı. Daha sonra veya başka bir modelle deneyin.";
        const lowered = message.toLowerCase();
        const code = lowered.includes("rate")
          ? "RATE_LIMIT"
          : lowered.includes("api key") || lowered.includes("authentication")
            ? "GATEWAY_NOT_READY"
            : lowered.includes("model")
              ? "MODEL_UNAVAILABLE"
              : "UPSTREAM";
        controller.enqueue(encode.encode(sseChunk("error", { message, code })));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
};

export const config: Config = {
  path: "/api/chat",
  method: ["POST", "OPTIONS"],
};
