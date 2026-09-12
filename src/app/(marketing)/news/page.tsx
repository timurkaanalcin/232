import type { Metadata } from "next";
import { NewsIndex } from "@/modules/finance/news-pages";

export const metadata: Metadata = { title: "Haberler" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <NewsIndex category={category} />;
}
