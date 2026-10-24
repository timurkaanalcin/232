import { getNodeEnv } from "@/node-runtime/env";

/**
 * Returns the runtime environment (bindings + secrets).
 * Node.js build: D1 is emulated with SQLite and Durable Objects run in-process.
 */
export function getEnv(): CloudflareEnv {
  return getNodeEnv();
}

export function getDb(): D1Database {
  return getEnv().DB;
}
