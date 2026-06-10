import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Returns the Cloudflare Worker environment (bindings + secrets). */
export function getEnv(): CloudflareEnv {
  return getCloudflareContext().env as CloudflareEnv;
}

export function getDb(): D1Database {
  return getEnv().DB;
}
