#!/usr/bin/env node
/**
 * googlefinance.login.org.tr adresini borsahatti Worker'ına bağlar.
 *
 * Önkoşullar:
 * 1. login.org.tr Natro'dan alınmış olsun
 * 2. Alan adı Cloudflare'e zone olarak eklensin
 * 3. Natro'da nameserver'lar Cloudflare'inkilerle değiştirilsin
 * 4. `npx wrangler login` yapılmış olsun
 *
 * Kullanım: node scripts/infra/attach-natro-domain.mjs
 */
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib.mjs";

const HOST = "googlefinance.login.org.tr";
const WORKER = "borsahatti";

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: "inherit" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

console.log(`==> Worker custom domain: ${HOST}`);
run("npx", ["wrangler", "domains", "add", HOST, "--name", WORKER]);

console.log(`==> AUTH_URL = https://${HOST}`);
const put = spawnSync("npx", ["wrangler", "secret", "put", "AUTH_URL", "--name", WORKER], {
  cwd: ROOT,
  encoding: "utf8",
  input: `https://${HOST}\n`,
  stdio: ["pipe", "inherit", "inherit"],
});
if (put.status !== 0) process.exit(put.status ?? 1);

console.log(`
Hazır. Kontrol:

  curl -fsS https://${HOST}/api/health

Natro tarafında nameserver değişmediyse Cloudflare zone ekleme sihirbazındaki
NS1 / NS2 değerlerini Natro → Alan Adı Yönetimi → Nameserver olarak yapıştırın.
`);
