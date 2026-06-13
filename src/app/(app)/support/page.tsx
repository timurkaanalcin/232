import type { Metadata } from "next";
import { SupportCenter } from "@/modules/support/support-center";

export const metadata: Metadata = { title: "Canlı Destek" };

export default function SupportPage() {
  return <SupportCenter />;
}
