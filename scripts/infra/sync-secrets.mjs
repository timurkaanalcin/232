#!/usr/bin/env node
/**
 * Push app secrets to Cloudflare Worker (remote).
 * Reads from process env / .env.infra — never commit real values.
 */
import { loadInfraEnv, run } from "./lib.mjs";

const SECRET_NAMES = [
  "AUTH_SECRET",
  "AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_ADMIN_CHAT_ID",
];

const remote = process.argv.includes("--remote");
loadInfraEnv();

if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
  console.error("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID.");
  process.exit(1);
}

if (!remote) {
  console.log("Pass --remote to sync secrets to production Worker.");
  process.exit(0);
}

for (const required of ["AUTH_SECRET", "AUTH_URL"]) {
  if (!process.env[required]?.trim()) {
    console.error(`Missing required secret: ${required}`);
    process.exit(1);
  }
}

let synced = 0;
for (const name of SECRET_NAMES) {
  const value = process.env[name];
  if (!value?.trim()) continue;
  console.log(`==> wrangler secret put ${name}`);
  run("npx", ["wrangler", "secret", "put", name, "--name", "livetrack"], {
    input: value,
    stdio: "pipe",
  });
  synced++;
}

if (synced === 0) {
  console.warn("No secrets found in environment. Set AUTH_SECRET and AUTH_URL at minimum.");
  process.exit(1);
}

console.log(`Synced ${synced} secret(s) to Cloudflare.`);
