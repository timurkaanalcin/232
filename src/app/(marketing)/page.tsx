import type { Metadata } from "next";
import { NewsHome } from "@/modules/marketing/news-home";

import { SITE_NAME } from "@/modules/marketing/news-articles";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Borsa, döviz, altın ve ekonomi haberleri`,
  description: "Canlı piyasa verileri, BIST, döviz kurları, altın, video haberler ve finans gündemi.",
  openGraph: {
    title: SITE_NAME,
    description: "Türkiye finans gündemi — borsa, döviz, altın, kripto",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function LandingPage() {
  return <NewsHome />;
}
