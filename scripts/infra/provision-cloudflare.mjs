#!/usr/bin/env node
/**
 * Provision Cloudflare D1 and patch wrangler.jsonc automatically.
 * Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env or .env.infra
 */
import {
  ROOT,
  ensureCloudflareCredentials,
  run,
  getWranglerDatabaseId,
  setWranglerDatabaseId,
  isPlaceholderDatabaseId,
  listD1Databases,
  parseDatabaseIdFromCreate,
} from "./lib.mjs";

const DB_NAME = "livetrack-db";

try {
  const { accountId } = ensureCloudflareCredentials();
  console.log(`Cloudflare account: ${accountId}`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const currentId = getWranglerDatabaseId();
if (!isPlaceholderDatabaseId(currentId)) {
  console.log(`wrangler.jsonc already has database_id: ${currentId}`);
  process.exit(0);
}

console.log(`==> Resolving D1 database "${DB_NAME}"`);
const existing = listD1Databases().find((db) => db.name === DB_NAME || db.database_name === DB_NAME);

let databaseId = existing?.uuid ?? existing?.database_id;

if (!databaseId) {
  console.log(`==> Creating D1 database "${DB_NAME}"`);
  const out = run("npx", ["wrangler", "d1", "create", DB_NAME], { capture: true });
  databaseId = parseDatabaseIdFromCreate(out);
  if (!databaseId) {
    console.error("Could not parse database id from wrangler d1 create output:", out);
    process.exit(1);
  }
  console.log(`    Created: ${databaseId}`);
} else {
  console.log(`    Found existing: ${databaseId}`);
}

setWranglerDatabaseId(databaseId);
console.log(`==> Updated ${ROOT}/wrangler.jsonc`);
console.log("Done. Run: npm run db:migrate:remote && npm run deploy");
