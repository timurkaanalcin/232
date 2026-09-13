import type { Metadata } from "next";
import { AdminSessionsModule } from "@/modules/admin/sessions";

export const metadata: Metadata = { title: "Oturumlar" };

export default function AdminSessionsPage() {
  return <AdminSessionsModule />;
}
