import type { Metadata } from "next";
import { InstantWebsite } from "@/modules/marketing/instant-website";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "CanlıSite — Komuta merkezi",
  description: "İzin temelli konum paylaşımı, admin operasyonları ve risk/cüzdan kontrolü için komuta merkezi.",
  openGraph: {
    title: "CanlıSite",
    description: "Karanlık komuta arayüzü: operasyon, risk, cüzdan ve canlı harita.",
    url: SITE_URL,
    siteName: "CanlıSite",
    type: "website",
  },
};

export default function LandingPage() {
  return <InstantWebsite />;
}
