import { apiHandler, assertSameOrigin, badRequest, jsonOk, notFound, requireUser } from "@/lib/api";
import { supportMessageSchema } from "@/lib/validators";
import { addSupportMessage, canAccessClientSupport, ensureClientExists, getClientDetail } from "@/services/client-detail";

function resolveClientId(actor: { id: string; role: string }, value: string | null | undefined): string {
  return actor.role === "user" ? actor.id : (value ?? "");
}

export const GET = apiHandler(async (request: Request) => {
  const { user, db } = await requireUser();
  const url = new URL(request.url);
  const clientId = resolveClientId(user, url.searchParams.get("clientId"));
  if (!clientId || !(await ensureClientExists(db, clientId))) throw notFound("Client");
  if (!(await canAccessClientSupport(db, clientId, { id: user.id, role: user.role }))) throw notFound("Client");

  const detail = await getClientDetail(db, clientId, { id: user.id, role: user.role });
  if (!detail) throw notFound("Client");
  return jsonOk({
    client: {
      id: detail.user.id,
      name: detail.user.name,
      clientNumericId: detail.user.clientNumericId,
      managerName: detail.user.managerName,
    },
    messages: detail.supportMessages,
  });
});

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db } = await requireUser();
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = supportMessageSchema.safeParse(body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid message");

  const clientId = resolveClientId(user, typeof body?.clientId === "string" ? body.clientId : null);
  if (!clientId || !(await ensureClientExists(db, clientId))) throw notFound("Client");
  if (!(await canAccessClientSupport(db, clientId, { id: user.id, role: user.role }))) throw notFound("Client");

  const message = await addSupportMessage(db, {
    clientId,
    senderId: user.id,
    senderName: user.name,
    senderEmail: user.email,
    senderRole: user.role,
    body: parsed.data.body,
  });

  return jsonOk({ message }, { status: 201 });
});
