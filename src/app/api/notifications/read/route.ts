import { apiHandler, assertSameOrigin, badRequest, jsonOk, requireUser } from "@/lib/api";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notifications";

export const POST = apiHandler(async (request: Request) => {
  await assertSameOrigin(request);
  const { user, db } = await requireUser();
  const body = (await request.json().catch(() => ({}))) as { id?: number; all?: boolean };

  if (body.all) {
    await markAllNotificationsRead(db, user.id);
    return jsonOk({ ok: true });
  }
  if (typeof body.id === "number") {
    const updated = await markNotificationRead(db, user.id, body.id);
    return jsonOk({ ok: true, updated });
  }
  throw badRequest("Provide { id: number } or { all: true }");
});
