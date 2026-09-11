import type { Metadata } from "next";
import { LandingPage } from "@/modules/marketing/landing";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "LiveTrack — Consent-first real-time location sharing",
  description:
    "Enterprise-grade real-time location sharing with explicit consent, full audit trails, live maps and GDPR/KVKK-compliant data handling.",
  openGraph: {
    title: "LiveTrack",
    description: "Consent-first real-time location sharing",
    url: SITE_URL,
    siteName: "LiveTrack",
    type: "website",
  },
};

export default function MarketingPage() {
  return <LandingPage />;
}
