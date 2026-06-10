import { verifyTicket } from "@/lib/ws-ticket";
import { ADMIN_ROLES, REALTIME } from "@/lib/constants";
import type { RoleId } from "@/types";

/**
 * Handles `GET /realtime/ws` at the Worker level (before Next.js).
 * Authenticates the short-lived signed ticket and forwards the upgrade to the
 * LocationHub Durable Object with identity headers attached.
 */
export async function handleRealtimeUpgrade(request: Request, env: CloudflareEnv): Promise<Response> {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }

  const ticket = new URL(request.url).searchParams.get("ticket");
  if (!ticket) {
    return new Response("Missing ticket", { status: 401 });
  }

  const payload = await verifyTicket(env.AUTH_SECRET, ticket);
  if (!payload) {
    return new Response("Invalid or expired ticket", { status: 401 });
  }

  if (payload.scope === "view" && !ADMIN_ROLES.includes(payload.role as RoleId)) {
    return new Response("Forbidden", { status: 403 });
  }
  if (payload.scope === "publish" && !payload.lsid) {
    return new Response("Missing session", { status: 400 });
  }

  const forwarded = new Request(request);
  forwarded.headers.set("x-lt-user", payload.sub);
  forwarded.headers.set("x-lt-role", payload.role);
  forwarded.headers.set("x-lt-scope", payload.scope);
  forwarded.headers.set("x-lt-name", payload.name);
  if (payload.lsid) forwarded.headers.set("x-lt-lsid", payload.lsid);

  const stub = env.LOCATION_HUB.getByName(REALTIME.HUB_NAME);
  return stub.fetch(forwarded);
}
