import type { Metadata } from "next";
import { AuditLogModule } from "@/modules/admin/audit-log";

export const metadata: Metadata = { title: "Audit logs" };

export default function AdminAuditPage() {
  return <AuditLogModule />;
}
