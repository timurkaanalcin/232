import type { Metadata } from "next";
import { ValuationsAdmin } from "@/modules/admin/leads-admin";

export const metadata: Metadata = { title: "Değerlemeler" };

export default function AdminValuationsPage() {
  return <ValuationsAdmin />;
}
