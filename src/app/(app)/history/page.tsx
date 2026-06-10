import type { Metadata } from "next";
import { HistoryModule } from "@/modules/location/history";

export const metadata: Metadata = { title: "Session history" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  return <HistoryModule initialSessionId={session ?? null} />;
}
