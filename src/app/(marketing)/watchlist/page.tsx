import type { Metadata } from "next";
import { WatchlistPage } from "@/modules/finance/watchlist-page";

export const metadata: Metadata = { title: "İzleme listesi" };

export default function Page() {
  return <WatchlistPage />;
}
