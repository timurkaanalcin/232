import type { Metadata } from "next";
import { DashboardModule } from "@/modules/location/dashboard";

export const metadata: Metadata = { title: "Komuta" };

export default function DashboardPage() {
  return <DashboardModule />;
}
