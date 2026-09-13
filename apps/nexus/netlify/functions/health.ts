import type { Config } from "@netlify/functions";
import { gatewayReady } from "./_shared/env";

export default async () =>
  Response.json({
    ok: true,
    service: "nexus",
    gatewayReady: gatewayReady(),
  });

export const config: Config = {
  path: "/api/health",
};
