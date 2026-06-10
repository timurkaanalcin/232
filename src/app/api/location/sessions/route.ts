import { apiHandler, assertSameOrigin, badRequest, jsonOk, requireUser } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS, REALTIME } from "@/lib/constants";
import { paginationSchema, startLocationSessionSchema } from "@/lib/validators";
import {
  getActiveSessionForUser,
  listSessionsForUser,
  startLocationSession,
  toLocationSessionDTO,
} from "@/services/location-sessions";

/** Session history + currently active session for the signed-in user. */
export const GET = apiHandler(async (request: Request) => {
  const { user, db } = await requireUser();
  const url = new URL(request.url);
  const { page, pageSize } = paginationSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  const [history, active] = await Promise.all([
    listSessionsForUser(db, user.id, page, pageSize),
    getActiveSessionForUser(db, user.id),
  ]);

  return jsonOk({ history, active: active ? toLocationSessionDTO(active) : null });
});

/**
 * Start a location sharing session. Requires `consent: true` in the body -
 * the consent timestamp is stored with the session and audit-logged.
 */
export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db, env, meta } = await requireUser();

  const parsed = startLocationSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Explicit consent is required");
  }

  const row = await startLocationSession(db, {
    userId: user.id,
    deviceSessionId: user.sessionId,
    label: parsed.data.label,
  });
  const session = toLocationSessionDTO(row);
  session.userName = user.name;
  session.userEmail = user.email;

  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.PERMISSION_GRANTED,
    targetType: "location_session",
    targetId: session.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { consentGrantedAt: row.consent_granted_at },
  });
  await logAudit(db, {
    actorId: user.id,
    actorEmail: user.email,
    action: AUDIT_ACTIONS.LOCATION_SESSION_STARTED,
    targetType: "location_session",
    targetId: session.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { label: parsed.data.label },
  });

  const hub = env.LOCATION_HUB.getByName(REALTIME.HUB_NAME);
  await hub.sessionStarted(session);

  return jsonOk({ session }, { status: 201 });
});
