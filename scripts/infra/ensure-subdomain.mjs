#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ensureCloudflareCredentials } from "./lib.mjs";

const cfg = join(homedir(), "Library/Preferences/.wrangler/config/default.toml");
if (!existsSync(cfg)) process.exit(0);

const token = readFileSync(cfg, "utf8").match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
const { accountId } = ensureCloudflareCredentials();
if (!token) process.exit(0);

const sub = (process.env.WORKERS_SUBDOMAIN ?? "timurkaanalcin").trim();
const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
  {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ subdomain: sub }),
  },
);
const data = await res.json();
if (data.success) console.log(`workers.dev subdomain: ${sub}`);
else if (data.errors?.[0]?.code === 10021) console.log("subdomain already set");
else console.warn("subdomain:", data.errors?.[0]?.message ?? data);
