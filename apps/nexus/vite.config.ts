import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

function localApi(): Plugin {
  return {
    name: "nexus-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }
        try {
          const request = await nodeToRequest(req);
          const { default: models } = await import("./netlify/functions/models");
          const { default: chat } = await import("./netlify/functions/chat");
          const { default: health } = await import("./netlify/functions/health");
          const handler = url.startsWith("/api/chat") ? chat : url.startsWith("/api/health") ? health : models;
          const response = await handler(request);
          await writeResponse(res, response);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "api" }));
        }
      });
    },
  };
}

async function nodeToRequest(req: IncomingMessage): Promise<Request> {
  const url = `http://127.0.0.1${req.url ?? "/"}`;
  const chunks: Buffer[] = [];
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  return new Request(url, {
    method: req.method,
    headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

async function writeResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (!response.body) {
    res.end();
    return;
  }
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

export default defineConfig({
  plugins: [react(), localApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
