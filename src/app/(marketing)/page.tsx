import type { Metadata } from "next";
import { NewsHome } from "@/modules/marketing/news-home";

export const metadata: Metadata = {
  title: "Finans Terminal — Borsa, döviz, altın ve ekonomi haberleri",
  description: "Canlı piyasa verileri, BIST, döviz kurları, altın ve finans gündemi.",
};

export default function LandingPage() {
  return <NewsHome />;
}
