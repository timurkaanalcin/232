import type { Metadata } from "next";
import { InventoryAdmin } from "@/modules/admin/inventory";

export const metadata: Metadata = { title: "Stok" };

export default function AdminVehiclesPage() {
  return <InventoryAdmin />;
}
