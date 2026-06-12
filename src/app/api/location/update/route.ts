import {
  apiHandler,
  assertSameOrigin,
  badRequest,
  enforceRateLimit,
  forbidden,
  jsonOk,
  notFound,
  requireUser,
} from "@/lib/api";
import { RATE_LIMITS, REALTIME } from "@/lib/constants";
import { locationUpdateSchema } from "@/lib/validators";
import { getLocationSession } from "@/services/location-sessions";
import { resolveAndStoreSessionAddress } from "@/services/session-address";

/**
 * REST fallback for position updates when the WebSocket is unavailable.
 * The position flows through the LocationHub so viewers still get realtime
 * broadcasts and persistence throttling stays consistent.
 */
export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, env } = await requireUser();
  await enforceRateLimit(`locupdate:${user.id}`, RATE_LIMITS.LOCATION_UPDATE, env);

  const parsed = locationUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest("Invalid location payload");

  const row = await getLocationSession(db, parsed.data.sessionId);
  if (!row) throw notFound("Location session");
  if (row.user_id !== user.id) throw forbidden();
  if (row.status !== "active") throw badRequest("Session is not active");

  const hub = env.LOCATION_HUB.getByName(REALTIME.HUB_NAME);
  await hub.publishPosition(row.id, user.id, parsed.data.position);

  // Admin harita snapshot'ı hemen güncellensin (DO gecikmesine karşı yedek).
  const now = Date.now();
  await db
    .prepare(
      `UPDATE location_sessions
       SET last_lat = ?, last_lng = ?, last_accuracy = ?, last_update_at = ?
       WHERE id = ? AND status = 'active'`,
    )
    .bind(
      parsed.data.position.lat,
      parsed.data.position.lng,
      parsed.data.position.acc,
      now,
      row.id,
    )
    .run();

  void resolveAndStoreSessionAddress(db, env, row, parsed.data.position.lat, parsed.data.position.lng, parsed.data.position.acc);

  return jsonOk({ ok: true });
});
