import type { Metadata } from "next";
import { NewsHome } from "@/modules/marketing/news-home";

export const metadata: Metadata = {
  title: "Gündem Haber — Son dakika, ekonomi, spor ve daha fazlası",
  description: "Türkiye ve dünyadan son dakika haberleri, ekonomi, spor, teknoloji ve sağlık gündemi.",
};

export default function LandingPage() {
  return <NewsHome />;
}
