import { NextResponse } from "next/server";
import { sweepStaleSessions } from "@/node-runtime/env";

export const dynamic = "force-dynamic";

/**
 * Stale location-session cleanup, triggered by Vercel Cron (see vercel.json).
 * Sweeps also run lazily on location/stat requests, so this is a safety net.
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 */
export const GET = async (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 });
  }
  const ended = await sweepStaleSessions();
  return NextResponse.json({ ok: true, ended }, { headers: { "Cache-Control": "no-store" } });
};
