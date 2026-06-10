#!/usr/bin/env node
/**
 * Bootstrap a super admin account.
 *
 * Usage:
 *   node scripts/create-admin.mjs --email admin@example.com --password 'S3cure!pass' [--name "Admin"] [--remote]
 *
 * Generates a PBKDF2 password hash (identical to the runtime format) and
 * inserts the user via `wrangler d1 execute`. Defaults to the local D1
 * database; pass --remote to target production.
 */
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";

const PBKDF2_ITERATIONS = 100_000;

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--remote") args.remote = true;
    else if (a.startsWith("--")) args[a.slice(2)] = argv[++i];
  }
  return args;
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

const { email, password, name = "Administrator", remote = false } = parseArgs(process.argv);

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs --email <email> --password <password> [--name <name>] [--remote]");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Invalid email address.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, "sha256");
const stored = `pbkdf2$${PBKDF2_ITERATIONS}$${b64url(salt)}$${b64url(hash)}`;

const esc = (s) => s.replaceAll("'", "''");
const now = Date.now();
const sql =
  `INSERT INTO users (id, email, email_verified, name, password_hash, role_id, status, created_at, updated_at) ` +
  `VALUES ('${randomUUID()}', '${esc(email.toLowerCase())}', 1, '${esc(name)}', '${stored}', 'super_admin', 'active', ${now}, ${now}) ` +
  `ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, role_id = 'super_admin', status = 'active', updated_at = ${now};`;

const args = ["wrangler", "d1", "execute", "livetrack-db", remote ? "--remote" : "--local", "--command", sql];
console.log(`Creating super admin '${email}' on ${remote ? "REMOTE" : "local"} database...`);
const res = spawnSync("npx", args, { stdio: "inherit" });
process.exit(res.status ?? 0);
