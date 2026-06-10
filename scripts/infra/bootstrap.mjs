#!/usr/bin/env node
/**
 * One-shot infrastructure bootstrap:
 *   1. Provision D1 + patch wrangler.jsonc
 *   2. Sync secrets to Cloudflare (optional)
 *   3. Remote migrations + deploy (optional)
 *   4. Push to GitHub (optional)
 *
 * Configure via .env.infra — see .env.infra.example
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, loadInfraEnv, run } from "./lib.mjs";

const args = new Set(process.argv.slice(2));
const skipPush = args.has("--no-push");
const skipDeploy = args.has("--no-deploy");
const skipSecrets = args.has("--no-secrets");

loadInfraEnv();

const infraFile = resolve(ROOT, ".env.infra");
if (!existsSync(infraFile)) {
  console.error("Create .env.infra from .env.infra.example and fill in tokens.");
  process.exit(1);
}

function step(script, extraArgs = []) {
  const path = resolve(ROOT, "scripts/infra", script);
  run("node", [path, ...extraArgs]);
}

console.log("==> [1/5] Provision Cloudflare D1");
step("provision-cloudflare.mjs");

if (!skipSecrets) {
  console.log("==> [2/5] Sync secrets to Cloudflare Worker");
  try {
    step("sync-secrets.mjs", ["--remote"]);
  } catch (e) {
    console.warn("Secret sync skipped or failed:", e.message);
    console.warn("Set AUTH_SECRET + AUTH_URL in .env.infra for production.");
  }
} else {
  console.log("==> [2/5] Skipped secret sync (--no-secrets)");
}

console.log("==> [3/5] Apply remote D1 migrations");
run("npm", ["run", "db:migrate:remote"]);

if (!skipDeploy) {
  console.log("==> [4/5] Build & deploy to Cloudflare");
  run("npm", ["run", "deploy"]);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log("==> Creating/updating super admin on remote DB");
    spawnSync(
      "node",
      [
        "scripts/create-admin.mjs",
        "--email",
        adminEmail,
        "--password",
        adminPassword,
        "--remote",
      ],
      { cwd: ROOT, stdio: "inherit" },
    );
  }
} else {
  console.log("==> [4/5] Skipped deploy (--no-deploy)");
}

if (!skipPush) {
  console.log("==> [5/5] Push to GitHub");
  try {
    step("push-github.mjs");
  } catch (e) {
    console.warn("GitHub push failed:", e.message);
    console.warn("Add GITHUB_TOKEN to .env.infra or push manually after gh auth login.");
  }
} else {
  console.log("==> [5/5] Skipped GitHub push (--no-push)");
}

console.log("\nBootstrap finished.");
console.log("Every future push to main triggers: test → migrate → deploy (GitHub Actions).");
