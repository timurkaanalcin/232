import type { Metadata } from "next";
import { TradingWorkspace } from "@/modules/admin/trading-workspace";

export const metadata: Metadata = { title: "CRM Trading Terminal" };

export default function AdminTradingPage() {
  return <TradingWorkspace />;
}
