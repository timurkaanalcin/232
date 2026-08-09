import { apiHandler, assertSameOrigin, badRequest, jsonOk, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { createRiskEventSchema, riskEventQuerySchema } from "@/lib/validators";
import { createRiskEvent, listRiskEvents } from "@/services/risk-events";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("risk.view");
  const url = new URL(request.url);
  const parsed = riskEventQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    severity: url.searchParams.get("severity") ?? undefined,
    source: url.searchParams.get("source") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
  });

  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid risk event query");
  }

  const { type, ...filter } = parsed.data;
  return jsonOk(await listRiskEvents(db, { ...filter, eventType: type }));
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("risk.manage");
  const parsed = createRiskEventSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid risk event");
  }

  const event = await createRiskEvent(db, parsed.data);
  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.ADMIN_RISK_EVENT_CREATED,
    targetType: "risk_event",
    targetId: String(event.id),
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: {
      eventType: event.eventType,
      severity: event.severity,
      riskScore: event.riskScore,
      source: event.source,
    },
  });

  return jsonOk({ event }, { status: 201 });
});
