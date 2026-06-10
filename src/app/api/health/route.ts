import { NextResponse } from "next/server";
import { getEnv } from "@/lib/db";
import { REALTIME } from "@/lib/constants";

export const GET = async () => {
  const checks: Record<string, "ok" | "error"> = { app: "ok", database: "error", realtime: "error" };

  const env = getEnv();
  try {
    await env.DB.prepare("SELECT 1").first();
    checks.database = "ok";
  } catch {
    // database unreachable
  }
  try {
    await env.LOCATION_HUB.getByName(REALTIME.HUB_NAME).connectionCounts();
    checks.realtime = "ok";
  } catch {
    // durable object unreachable
  }

  const healthy = Object.values(checks).every((status) => status === "ok");
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
};
