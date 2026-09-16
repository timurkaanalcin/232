#!/usr/bin/env node
/**
 * Rasterize public/favicon.svg into every llvadAI icon / OG asset
 * so PWA, Electron, and social images match the in-app BrandMark 1:1.
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INK = "#070504";
const svg = await readFile(path.join(root, "public/favicon.svg"), "utf8");
const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");

function wrapMark(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${INK}"/>
  ${inner}
</svg>`;
}

function renderPng(markup, width, fontFiles = []) {
  const resvg = new Resvg(markup, {
    fitTo: { mode: "width", value: width },
    font: {
      fontFiles,
      loadSystemFonts: true,
      defaultFontFamily: fontFiles.length ? "Outfit" : "sans-serif",
    },
  });
  return resvg.render().asPng();
}

async function loadFont(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font ${url} → ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

const sizes = [
  ["public/favicon-32.png", 32],
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/app-icon.png", 1024],
];

for (const [rel, size] of sizes) {
  const dest = path.join(root, rel);
  await writeFile(dest, renderPng(wrapMark(size), size));
  console.log("wrote", dest);
}

await copyFile(path.join(root, "public/app-icon.png"), path.join(root, "build/icon.png"));
console.log("wrote", path.join(root, "build/icon.png"));

const fontDir = path.join(os.tmpdir(), "llvad-fonts");
await mkdir(fontDir, { recursive: true });
const display = await loadFont(
  "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf",
  path.join(fontDir, "CormorantGaramond.ttf"),
);
const ui = await loadFont(
  "https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/Outfit%5Bwght%5D.ttf",
  path.join(fontDir, "Outfit.ttf"),
);

const og = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="6%" cy="-14%" r="70%">
      <stop offset="0%" stop-color="#ff6b1a" stop-opacity="0.18"/>
      <stop offset="54%" stop-color="#ff6b1a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="108%" cy="8%" r="55%">
      <stop offset="0%" stop-color="#ffb347" stop-opacity="0.08"/>
      <stop offset="48%" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="50%" cy="120%" r="50%">
      <stop offset="0%" stop-color="#c2410c" stop-opacity="0.12"/>
      <stop offset="44%" stop-color="#c2410c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <rect width="1200" height="630" fill="url(#g3)"/>
  <svg x="88" y="217" width="196" height="196" viewBox="0 0 64 64">${inner}</svg>
  <text x="320" y="318" fill="#f4eadc" font-family="Cormorant Garamond" font-size="92" font-weight="600" letter-spacing="0.9">llvad<tspan fill="#ff6b1a" font-weight="700">AI</tspan></text>
  <text x="324" y="358" fill="#9a8774" font-family="Outfit" font-size="15" font-weight="500" letter-spacing="4.2">LÜKS ZEKA. TÜM MODELLER.</text>
</svg>`;

await writeFile(path.join(root, "public/og.png"), renderPng(og, 1200, [display, ui]));
console.log("wrote", path.join(root, "public/og.png"));
