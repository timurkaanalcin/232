import type { Metadata } from "next";
import { AdminDashboard } from "@/modules/admin/dashboard";

export const metadata: Metadata = { title: "Operasyon" };

export default function AdminPage() {
  return <AdminDashboard />;
}
