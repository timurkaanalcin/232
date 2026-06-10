#!/usr/bin/env node
/**
 * Tam otomatik kurulum — tek giriş noktası.
 * wrangler login / gh auth login bir kez yapıldıktan sonra her şey otomatik.
 *
 *   npm run infra:run
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import {
  ROOT,
  loadInfraEnv,
  isWranglerAuthenticated,
  getCloudflareAccountId,
  run,
} from "./lib.mjs";

const INFRA = resolve(ROOT, ".env.infra");
const EXAMPLE = resolve(ROOT, ".env.infra.example");

function log(step, msg) {
  console.log(`\n[${step}] ${msg}`);
}

function ghOk() {
  return spawnSync("gh", ["auth", "status"], { stdio: "ignore" }).status === 0;
}

function ensureEnvInfra() {
  if (!existsSync(INFRA)) {
    const tpl = readFileSync(EXAMPLE, "utf8");
    const secret = randomBytes(32).toString("base64");
    writeFileSync(INFRA, tpl.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET=${secret}`), "utf8");
    log("1/7", ".env.infra oluşturuldu");
  } else {
    log("1/7", ".env.infra mevcut");
  }
  loadInfraEnv();
}

function patchAccountId() {
  const id = getCloudflareAccountId();
  if (!id) return;
  let content = readFileSync(INFRA, "utf8");
  if (!content.match(/^CLOUDFLARE_ACCOUNT_ID=.+$/m)) {
    content = content.replace(/^CLOUDFLARE_ACCOUNT_ID=.*$/m, `CLOUDFLARE_ACCOUNT_ID=${id}`);
    writeFileSync(INFRA, content, "utf8");
    loadInfraEnv();
    log("2/7", `Account ID kaydedildi: ${id}`);
  }
}

function ensureWrangler() {
  if (isWranglerAuthenticated()) {
    log("2/7", "Cloudflare oturumu aktif");
    patchAccountId();
    return;
  }
  log("2/7", "Cloudflare girişi gerekli — tarayıcı açılacak");
  const r = spawnSync("npx", ["wrangler", "login"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error("wrangler login başarısız");
  patchAccountId();
}

function ensureGithub() {
  if (ghOk()) {
    log("3/7", "GitHub oturumu aktif");
    spawnSync("gh", ["auth", "setup-git"], { cwd: ROOT, stdio: "inherit" });
    return;
  }
  if (process.env.GITHUB_TOKEN?.trim()) {
    log("3/7", "GITHUB_TOKEN ile push yapılacak");
    return;
  }
  log("3/7", "GitHub girişi gerekli — tarayıcı açılacak");
  const r = spawnSync("gh", ["auth", "login", "--hostname", "github.com", "--git-protocol", "https", "--web"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) throw new Error("gh auth login başarısız");
  spawnSync("gh", ["auth", "setup-git"], { cwd: ROOT, stdio: "inherit" });
}

function step(script, args = []) {
  run("node", [resolve(ROOT, "scripts/infra", script), ...args]);
}

try {
  ensureEnvInfra();
  ensureWrangler();
  ensureGithub();

  log("4/7", "D1 provision");
  step("provision-cloudflare.mjs");

  log("5/7", "Secret sync + migration");
  try {
    step("sync-secrets.mjs", ["--remote"]);
  } catch {
    console.warn("Secret sync uyarı — devam ediliyor");
  }
  run("npm", ["run", "db:migrate:remote"]);

  log("6/7", "Build & deploy");
  run("npm", ["run", "deploy"]);

  log("7/7", "GitHub push");
  if (process.env.GITHUB_TOKEN?.trim()) {
    step("push-github.mjs");
  } else {
    run("git", ["push", "-u", "origin", "main"]);
  }

  console.log("\n✓ Kurulum tamam. Her push otomatik deploy eder (GitHub Actions).");
  console.log(`  Site: ${process.env.AUTH_URL ?? "https://control.org.tr"}`);
} catch (e) {
  console.error("\n✗", e.message);
  process.exit(1);
}
