import type { Metadata } from "next";
import { SecurityCenter } from "@/modules/admin/security-center";

export const metadata: Metadata = { title: "Security center" };

export default function AdminSecurityPage() {
  return <SecurityCenter />;
}
