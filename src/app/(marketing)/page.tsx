import type { Metadata } from "next";
import { FinanceHome } from "@/modules/finance/finance-home";
import { SITE_NAME } from "@/modules/marketing/news-articles";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Piyasalar, haberler ve izleme listesi`,
  description: "Endeks, hisse, döviz, kripto ve emtia panosu. Özgün tasarım, yönetilebilir haber ve video içerikleri.",
  openGraph: {
    title: SITE_NAME,
    description: "Piyasa özeti, grafikler ve finans haberleri",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function LandingPage() {
  return <FinanceHome />;
}
