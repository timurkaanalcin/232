import type { Metadata } from "next";
import { LiveMapModule } from "@/modules/admin/live-map";

export const metadata: Metadata = { title: "Live map" };

export default function AdminMapPage() {
  return <LiveMapModule />;
}
