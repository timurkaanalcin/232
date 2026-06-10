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
  const out = run("npx", ["wrangler", "d1", "list", "--json"], { capture: true });
  try {
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : parsed?.result ?? [];
  } catch {
    return [];
  }
}
