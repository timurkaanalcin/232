import { apiHandler, jsonOk, requireUser } from "@/lib/api";
import { paginationSchema } from "@/lib/validators";
import { listUserConsentAudit } from "@/services/audit-query";

export const GET = apiHandler(async (request: Request) => {
  const { user, db } = await requireUser();
  const url = new URL(request.url);
  const { page, pageSize } = paginationSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  const log = await listUserConsentAudit(db, user.id, page, pageSize);
  return jsonOk(log);
});
