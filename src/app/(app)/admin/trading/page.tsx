import type { Metadata } from "next";
import { TradingWorkspace } from "@/modules/admin/trading-workspace";

export const metadata: Metadata = { title: "CRM Trading Terminal" };

export default async function AdminTradingPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  return <TradingWorkspace initialClientId={params.clientId ?? ""} />;
}
