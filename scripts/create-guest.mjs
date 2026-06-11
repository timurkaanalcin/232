#!/usr/bin/env node
/** Finans sitesi ziyaretçi hesabı — konum paylaşımı için */
import { spawnSync } from "node:child_process";
import { randomBytes, pbkdf2Sync, randomUUID } from "node:crypto";

const email = "ziyaretci@finans.local";
const password = "FinansZiyaret2026!";
const remote = process.argv.includes("--remote");

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100_000, 32, "sha256");
const stored = `pbkdf2$100000$${Buffer.from(salt).toString("base64url")}$${Buffer.from(hash).toString("base64url")}`;
const now = Date.now();
const sql =
  `INSERT INTO users (id, email, email_verified, name, password_hash, role_id, status, created_at, updated_at) ` +
  `VALUES ('${randomUUID()}', '${email}', 1, 'Finans Ziyaretçi', '${stored}', 'user', 'active', ${now}, ${now}) ` +
  `ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, status = 'active', updated_at = ${now};`;

spawnSync("npx", ["wrangler", "d1", "execute", "livetrack-db", remote ? "--remote" : "--local", "--command", sql], {
  stdio: "inherit",
});
console.log(`Guest: ${email} / ${password}`);
