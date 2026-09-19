import type { Metadata } from "next";
import { QuotePage } from "@/modules/finance/quote-page";

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const { symbol } = await params;
  return { title: decodeURIComponent(symbol) };
}

export default async function Page({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <QuotePage symbol={decodeURIComponent(symbol)} />;
}
