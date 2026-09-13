import type { Metadata } from "next";
import { ReservationsAdmin } from "@/modules/admin/leads-admin";

export const metadata: Metadata = { title: "Rezervasyonlar" };

export default function AdminReservationsPage() {
  return <ReservationsAdmin />;
}
