import type { Metadata } from "next";
import { InstantWebsite } from "@/modules/marketing/instant-website";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "CanlıSite — Anında güncellenen web sitesi",
  description: "Hot reload destekli modern Next.js web sitesi.",
  openGraph: {
    title: "CanlıSite",
    description: "Değiştir, kaydet, web sitesini anında gör.",
    url: SITE_URL,
    siteName: "CanlıSite",
    type: "website",
  },
};

export default function LandingPage() {
  return <InstantWebsite />;
}
