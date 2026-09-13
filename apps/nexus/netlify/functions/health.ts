import type { Config } from "@netlify/functions";
import { engineReady } from "../../src/lib/local-engine";

export default async () =>
  Response.json({
    ok: true,
    service: "nexus",
    engine: "gguf-local",
    gatewayReady: await engineReady(),
    cloud: false,
  });

export const config: Config = {
  path: "/api/health",
};
