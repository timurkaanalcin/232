#!/usr/bin/env node
/** Durum kontrolü — eksik adımları listeler */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function check(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return r.status === 0;
}

import { readFileSync } from "node:fs";
function hasKey(file, key) {
  if (!existsSync(file)) return false;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${key}=`));
  return Boolean(line?.split("=")[1]?.trim());
}

const items = [
  { ok: check("git", ["rev-parse", "--git-dir"]), label: "Git deposu" },
  { ok: check("git", ["remote", "get-url", "origin"]), label: "Git remote (origin)" },
  { ok: check("gh", ["auth", "status"]), label: "GitHub CLI oturumu (gh auth login)" },
  { ok: check("npx", ["wrangler", "whoami"]), label: "Cloudflare oturumu (wrangler login)" },
  { ok: existsSync(resolve(ROOT, ".env.infra")), label: ".env.infra dosyası" },
  { ok: hasKey(resolve(ROOT, ".env.infra"), "AUTH_SECRET"), label: "AUTH_SECRET" },
  { ok: hasKey(resolve(ROOT, ".env.infra"), "CLOUDFLARE_ACCOUNT_ID"), label: "CLOUDFLARE_ACCOUNT_ID" },
  { ok: hasKey(resolve(ROOT, ".env.infra"), "CLOUDFLARE_API_TOKEN"), label: "CLOUDFLARE_API_TOKEN (CI için)" },
  { ok: hasKey(resolve(ROOT, ".env.infra"), "GITHUB_TOKEN"), label: "GITHUB_TOKEN (opsiyonel)" },
];

console.log("\nLiveTrack altyapı durumu\n");
let ready = 0;
for (const { ok, label } of items) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (ok) ready++;
}

console.log(`\n${ready}/${items.length} hazır\n`);

const ghReady = check("gh", ["auth", "status"]);
const cfReady = check("npx", ["wrangler", "whoami"]);

if (!ghReady || !cfReady) {
  console.log("Tek komut kurulum (tarayıcıda 1 kez onay gerekir):");
  console.log("  npm run infra:run");
  console.log("\nCursor komut izni: Run / Allow'a tıklayın.\n");
  process.exit(1);
}

console.log("Hazır — çalıştırın: npm run infra:run\n");

process.exit(0);
