import { apiHandler, jsonOk, requirePermission } from "@/lib/api";
import { paginationSchema } from "@/lib/validators";
import { listSecurityEvents } from "@/services/security-events";
import type { SecuritySeverity } from "@/types";

export const GET = apiHandler(async (request: Request) => {
  const { db } = await requirePermission("audit.view");
  const url = new URL(request.url);
  const { page, pageSize } = paginationSchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  const eventType = url.searchParams.get("type") ?? undefined;
  const severity = url.searchParams.get("severity") as SecuritySeverity | null;
  return jsonOk(
    await listSecurityEvents(db, {
      page,
      pageSize,
      eventType: eventType ?? undefined,
      severity: severity && ["info", "warning", "critical"].includes(severity) ? severity : undefined,
    }),
  );
});
