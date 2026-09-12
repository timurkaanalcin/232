import type { Metadata } from "next";
import { MarketplaceDashboard } from "@/modules/admin/marketplace-dashboard";

export const metadata: Metadata = { title: "Operasyon" };

export default function AdminPage() {
  return <MarketplaceDashboard />;
}
