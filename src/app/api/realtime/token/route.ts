import { ApiError, apiHandler, badRequest, forbidden, getPermissions, jsonOk, notFound, requireUser } from "@/lib/api";
import { createTicket } from "@/lib/ws-ticket";
import { getActiveSessionForUser } from "@/services/location-sessions";

/**
 * Issues a short-lived signed ticket for the realtime WebSocket.
 * - `scope=publish`: requires an active location session owned by the caller.
 * - `scope=view`: requires the `map.live_view` permission (admin live map).
 */
export const GET = apiHandler(async (request: Request) => {
  const { user, db, env } = await requireUser();
  if (process.env.LIVETRACK_REALTIME_WS !== "on") {
    // Serverless deployment (Vercel): no WebSocket server. Clients fall back to
    // REST location updates and snapshot polling.
    throw new ApiError(503, "realtime_unavailable", "Realtime WebSocket is not available on this deployment");
  }
  const scope = new URL(request.url).searchParams.get("scope");

  if (scope !== "publish" && scope !== "view") {
    throw badRequest("scope must be 'publish' or 'view'");
  }

  let lsid: string | undefined;
  if (scope === "publish") {
    const active = await getActiveSessionForUser(db, user.id);
    if (!active) throw notFound("Active location session");
    lsid = active.id;
  } else {
    const permissions = await getPermissions(db, user.role);
    if (!permissions.has("map.live_view")) throw forbidden();
  }

  const ticket = await createTicket(env.AUTH_SECRET, {
    sub: user.id,
    role: user.role,
    sid: user.sessionId,
    scope,
    lsid,
    name: user.name,
  });

  return jsonOk({ ticket, url: "/realtime/ws", sessionId: lsid ?? null });
});
