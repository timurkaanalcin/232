import type { Metadata } from "next";
import { RiskCenter } from "@/modules/admin/risk-center";

export const metadata: Metadata = { title: "Risk center" };

export default function AdminRiskPage() {
  return <RiskCenter />;
}
