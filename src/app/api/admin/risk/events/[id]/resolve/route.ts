import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { riskEventActionSchema } from "@/lib/validators";
import { resolveRiskEvent } from "@/services/risk-events";

export const POST = apiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    await assertSameOrigin(request);
    const { user: actor, db, meta } = await requirePermission("risk.manage");
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) throw badRequest("Invalid risk event id");

    const parsed = riskEventActionSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid resolution");
    }

    const { event, changed } = await resolveRiskEvent(db, id, {
      actorId: actor.id,
      note: parsed.data.note,
    });
    if (!event) throw notFound("Risk event");

    if (changed) {
      await logAudit(db, {
        actorId: actor.id,
        actorEmail: actor.email,
        action: AUDIT_ACTIONS.ADMIN_RISK_EVENT_RESOLVED,
        targetType: "risk_event",
        targetId: String(event.id),
        ip: meta.ip,
        userAgent: meta.userAgent,
        metadata: {
          eventType: event.eventType,
          severity: event.severity,
          riskScore: event.riskScore,
          note: parsed.data.note,
        },
      });
    }

    return jsonOk({ event, changed });
  },
);
