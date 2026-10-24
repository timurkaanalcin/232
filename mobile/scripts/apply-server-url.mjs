import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Writes the optional build-time server URL into both native projects.
 * An empty file means "show the in-app setup screen".
 * SharedPreferences / UserDefaults still override this on later launches.
 */
function normalize(raw) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`LIVETRACK_SERVER_URL is not a valid URL: ${trimmed}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("LIVETRACK_SERVER_URL must start with http:// or https://");
  }
  if (!url.hostname || url.username || url.password) {
    throw new Error("LIVETRACK_SERVER_URL must be an origin without credentials");
  }
  if ((url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
    throw new Error("LIVETRACK_SERVER_URL must be the server origin, without a path or query");
  }
  return `${url.protocol}//${url.host}`;
}

const value = normalize(process.env.LIVETRACK_SERVER_URL);
const targets = [
  path.join(root, "android/app/src/main/assets/livetrack_server_url.txt"),
  path.join(root, "ios/App/App/livetrack_server_url.txt"),
];

for (const target of targets) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, value, "utf8");
}

console.log(value ? `LiveTrack server URL set to ${value}` : "No LIVETRACK_SERVER_URL set; the app will ask on first launch.");
