import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { PoolModel } from "../../../src/lib/types";
import { readEnv } from "./env";

export type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type StreamHandlers = {
  onText: (chunk: string) => void;
  onImage?: (image: { mimeType: string; data: string }) => void;
};

function openaiClient(baseURL?: string, apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey ?? readEnv("OPENAI_API_KEY") ?? "unused",
    baseURL: baseURL ?? readEnv("OPENAI_BASE_URL"),
  });
}

export async function streamModel(model: PoolModel, messages: IncomingMessage[], handlers: StreamHandlers) {
  if (model.transport === "unavailable") {
    throw new Error(
      model.vendor === "cursor"
        ? "Bu model şu an yalnızca Cursor içinde. Canlı havuza düşer düşmez otomatik açılır."
        : "Bu model henüz canlı havuzda değil. Yeni sürüm gelince Nexus onu otomatik ekler.",
    );
  }

  if (model.transport === "gemini") {
    await streamGemini(model, messages, handlers);
    return;
  }

  if (model.transport === "anthropic") {
    await streamAnthropic(model, messages, handlers);
    return;
  }

  if (model.transport === "openrouter") {
    await streamOpenAICompat(
      model,
      messages,
      handlers,
      readEnv("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1",
      readEnv("OPENROUTER_API_KEY") ?? readEnv("OPENAI_API_KEY"),
    );
    return;
  }

  await streamOpenAICompat(model, messages, handlers, readEnv("OPENAI_BASE_URL"), readEnv("OPENAI_API_KEY"));
}

async function streamOpenAICompat(
  model: PoolModel,
  messages: IncomingMessage[],
  handlers: StreamHandlers,
  baseURL?: string,
  apiKey?: string,
) {
  const client = openaiClient(baseURL, apiKey);
  const stream = await client.chat.completions.create({
    model: model.apiModel,
    stream: true,
    temperature: model.fast ? 0.4 : 0.7,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  });

  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) handlers.onText(delta);
  }
}

async function streamAnthropic(model: PoolModel, messages: IncomingMessage[], handlers: StreamHandlers) {
  const client = new Anthropic({
    apiKey: readEnv("ANTHROPIC_API_KEY"),
    baseURL: readEnv("ANTHROPIC_BASE_URL"),
  });
  const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const turns = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

  const stream = client.messages.stream({
    model: model.apiModel,
    max_tokens: model.fast ? 2048 : 4096,
    system: system || undefined,
    messages: turns,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      handlers.onText(event.delta.text);
    }
  }
}

async function streamGemini(model: PoolModel, messages: IncomingMessage[], handlers: StreamHandlers) {
  const ai = new GoogleGenAI({});
  const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  if (model.isImage) {
    const prompt = [...messages].reverse().find((message) => message.role === "user")?.content ?? "A luminous abstract portrait";
    const response = await ai.models.generateContent({
      model: model.apiModel,
      contents: prompt,
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let textOut = "";
    for (const part of parts) {
      if (part.text) textOut += part.text;
      if (part.inlineData?.data) {
        handlers.onImage?.({
          mimeType: part.inlineData.mimeType ?? "image/png",
          data: part.inlineData.data,
        });
      }
    }
    if (textOut) handlers.onText(textOut);
    return;
  }

  const stream = await ai.models.generateContentStream({
    model: model.apiModel,
    contents,
    config: system ? { systemInstruction: system } : undefined,
  });

  for await (const chunk of stream) {
    if (chunk.text) handlers.onText(chunk.text);
  }
}
