import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { auditQuerySchema } from "@/lib/validators";
import { listAuditLogs } from "@/services/audit-query";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("audit.view");
  const url = new URL(request.url);
  const filter = auditQuerySchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    actor: url.searchParams.get("actor") ?? undefined,
  });
  return jsonOk(await listAuditLogs(db, filter));
});
