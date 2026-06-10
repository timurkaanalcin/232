#!/usr/bin/env node
/**
 * Push current branch to GitHub using GITHUB_TOKEN (no interactive login).
 * Token needs repo scope. Store in .env.infra — never commit.
 */
import { spawnSync } from "node:child_process";
import { loadInfraEnv, ROOT, run } from "./lib.mjs";

loadInfraEnv();

const token = process.env.GITHUB_TOKEN?.trim();
if (!token) {
  console.error("GITHUB_TOKEN missing. Add to .env.infra (see .env.infra.example).");
  process.exit(1);
}

const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).stdout?.trim();

if (!branch) {
  console.error("Could not detect current git branch.");
  process.exit(1);
}

const remoteUrl = spawnSync("git", ["remote", "get-url", "origin"], {
  cwd: ROOT,
  encoding: "utf8",
}).stdout?.trim();

if (!remoteUrl) {
  console.error("No git remote 'origin' configured.");
  process.exit(1);
}

// https://github.com/owner/repo(.git) -> authenticated URL
const https = remoteUrl
  .replace(/^git@github\.com:/, "https://github.com/")
  .replace(/\.git$/, "");
const pushUrl = https.replace(
  /^https:\/\//,
  `https://x-access-token:${encodeURIComponent(token)}@`,
) + ".git";

console.log(`==> Pushing ${branch} to origin (token auth)`);
run("git", ["push", pushUrl, `HEAD:refs/heads/${branch}`, "--force-with-lease"]);
console.log("Push complete. GitHub Actions will run CI + deploy automatically.");
