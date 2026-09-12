import type { Metadata } from "next";
import { AppointmentsAdmin } from "@/modules/admin/leads-admin";

export const metadata: Metadata = { title: "Randevular" };

export default function AdminAppointmentsPage() {
  return <AppointmentsAdmin />;
}
