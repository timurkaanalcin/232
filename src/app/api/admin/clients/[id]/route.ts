import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requirePermission } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { requiresStatusSchedule } from "@/lib/constants";
import { clientCommentSchema, clientDetailUpdateSchema } from "@/lib/validators";
import { addClientComment, ensureClientExists, getClientDetail, updateClientDetail } from "@/services/client-detail";
import { findUserById } from "@/services/users";

export const GET = apiHandler(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { db } = await requirePermission("customers.manage");
  const { id } = await params;
  const detail = await getClientDetail(db, id);
  if (!detail) throw notFound("Client");
  return jsonOk({ detail });
});

export const PATCH = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("customers.manage");
  const { id } = await params;
  if (!(await ensureClientExists(db, id))) throw notFound("Client");

  const parsed = clientDetailUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid client update");

  const current = await findUserById(db, id);
  if (!current) throw notFound("Client");
  if (parsed.data.managerId) {
    const manager = await findUserById(db, parsed.data.managerId);
    if (!manager || manager.role_id === "user") throw badRequest("Selected manager does not exist");
  }

  const nextSaleStatus = parsed.data.saleStatus ?? current.sale_status;
  const nextSaleStatusScheduledAt =
    parsed.data.saleStatusScheduledAt !== undefined
      ? parsed.data.saleStatusScheduledAt
      : current.sale_status_scheduled_at;
  const nextRetentionStatus = parsed.data.retentionStatus ?? current.retention_status;
  const nextRetentionStatusScheduledAt =
    parsed.data.retentionStatusScheduledAt !== undefined
      ? parsed.data.retentionStatusScheduledAt
      : current.retention_status_scheduled_at;

  if (requiresStatusSchedule(nextSaleStatus) && !nextSaleStatusScheduledAt) {
    throw badRequest("Sale status date and time are required for Call Back and Active clients");
  }
  if (requiresStatusSchedule(nextRetentionStatus) && !nextRetentionStatusScheduledAt) {
    throw badRequest("Retention status date and time are required for Call Back and Active clients");
  }

  await updateClientDetail(db, id, parsed.data);
  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "crm.client_updated",
    targetType: "client",
    targetId: id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { changes: parsed.data },
  });

  const detail = await getClientDetail(db, id);
  return jsonOk({ detail });
});

export const POST = apiHandler(async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  await assertSameOrigin(request);
  const { user: actor, db, meta } = await requirePermission("customers.manage");
  const { id } = await params;
  if (!(await ensureClientExists(db, id))) throw notFound("Client");

  const parsed = clientCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid comment");

  const comment = await addClientComment(db, {
    clientId: id,
    authorId: actor.id,
    authorName: actor.name,
    authorEmail: actor.email,
    body: parsed.data.body,
  });

  await logAudit(db, {
    actorId: actor.id,
    actorEmail: actor.email,
    action: "crm.client_comment_added",
    targetType: "client",
    targetId: id,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { commentId: comment.id },
  });

  return jsonOk({ comment }, { status: 201 });
});
