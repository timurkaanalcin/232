import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(__dirname, "../..");
export const WRANGLER_PATH = resolve(ROOT, "wrangler.jsonc");

/** @param {string} file */
export function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function loadInfraEnv() {
  loadEnvFile(resolve(ROOT, ".env.infra"));
}

/** @returns {boolean} */
export function isWranglerAuthenticated() {
  const res = spawnSync("npx", ["wrangler", "whoami"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return res.status === 0 && !res.stdout?.includes("not authenticated");
}

/** @returns {string | null} */
export function getCloudflareAccountId() {
  if (process.env.CLOUDFLARE_ACCOUNT_ID?.trim()) {
    return process.env.CLOUDFLARE_ACCOUNT_ID.trim();
  }
  const res = spawnSync("npx", ["wrangler", "whoami"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (res.status !== 0) return null;
  const match = res.stdout?.match(/Account ID:\s*([a-f0-9]+)/i);
  return match?.[1] ?? null;
}

/** Wrangler OAuth OR API token — CI uses token, local uses login. */
export function ensureCloudflareCredentials() {
  loadInfraEnv();
  const accountId = getCloudflareAccountId();
  if (accountId) process.env.CLOUDFLARE_ACCOUNT_ID = accountId;

  const hasToken = Boolean(process.env.CLOUDFLARE_API_TOKEN?.trim());
  const hasOAuth = isWranglerAuthenticated();

  if (!hasToken && !hasOAuth) {
    throw new Error(
      "Cloudflare kimlik doğrulaması yok. Çalıştırın: npx wrangler login  (veya .env.infra içine CLOUDFLARE_API_TOKEN ekleyin)",
    );
  }
  if (!accountId) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID bulunamadı. wrangler login sonrası tekrar deneyin.");
  }
  return { accountId, hasToken, hasOAuth };
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ input?: string, env?: NodeJS.ProcessEnv, cwd?: string, capture?: boolean }} [opts]
 */
export function run(cmd, args, opts = {}) {
  const stdio = opts.input
    ? ["pipe", "pipe", "pipe"]
    : opts.capture
      ? ["inherit", "pipe", "pipe"]
      : "inherit";

  const res = spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    env: { ...process.env, ...opts.env },
    input: opts.input,
    encoding: "utf8",
    stdio,
  });
  if (res.status !== 0) {
    const err = res.stderr?.trim() || res.stdout?.trim() || `${cmd} exited ${res.status}`;
    throw new Error(err);
  }
  return res.stdout ?? "";
}

/** @param {string} databaseId */
export function setWranglerDatabaseId(databaseId) {
  const content = readFileSync(WRANGLER_PATH, "utf8");
  const updated = content.replace(/"database_id":\s*"[^"]*"/, `"database_id": "${databaseId}"`);
  if (updated === content) {
    throw new Error("Could not update database_id in wrangler.jsonc");
  }
  writeFileSync(WRANGLER_PATH, updated, "utf8");
}

/** @returns {string | null} */
export function getWranglerDatabaseId() {
  const content = readFileSync(WRANGLER_PATH, "utf8");
  const match = content.match(/"database_id":\s*"([^"]*)"/);
  return match?.[1] ?? null;
}

export function isPlaceholderDatabaseId(id) {
  return !id || id === "00000000-0000-0000-0000-000000000000";
}

/** @returns {{ uuid: string, name: string }[]} */
export function listD1Databases() {
  const out = run("npx", ["wrangler", "d1", "list"], { capture: true });
  const rows = [];
  for (const line of out.split("\n")) {
    const m = line.match(
      /│\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s*│\s*([^\s│]+)\s*│/i,
    );
    if (m) rows.push({ uuid: m[1], name: m[2], database_name: m[2] });
  }
  return rows;
}

/** @param {string} text */
export function parseDatabaseIdFromCreate(text) {
  const jsonMatch = text.match(/"database_id":\s*"([^"]+)"/);
  if (jsonMatch) return jsonMatch[1];
  const uuidMatch = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return uuidMatch?.[0] ?? null;
}
