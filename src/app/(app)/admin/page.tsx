import type { Metadata } from "next";
import { AdminDashboard } from "@/modules/admin/dashboard";

export const metadata: Metadata = { title: "Command center" };

export default function AdminPage() {
  return <AdminDashboard />;
}
