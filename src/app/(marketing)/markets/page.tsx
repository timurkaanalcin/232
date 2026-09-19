import type { Metadata } from "next";
import { MarketsPage } from "@/modules/finance/markets-page";

export const metadata: Metadata = { title: "Piyasalar" };

export default function Page() {
  return <MarketsPage />;
}
