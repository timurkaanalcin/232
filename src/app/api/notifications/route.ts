import { apiHandler, jsonOk, requireUser } from "@/lib/api";
import { paginationSchema } from "@/lib/validators";
import { countUnread, listNotifications } from "@/services/notifications";

export const GET = apiHandler(async (request: Request) => {
  const { user, db } = await requireUser();
  const url = new URL(request.url);
  const { page, pageSize } = paginationSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  const [list, unread] = await Promise.all([
    listNotifications(db, user.id, page, pageSize),
    countUnread(db, user.id),
  ]);
  return jsonOk({ ...list, unread });
});
