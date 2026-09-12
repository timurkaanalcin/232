import type { Metadata } from "next";
import { CATEGORY_LABELS } from "@/lib/finance/format";
import { MarketsPage } from "@/modules/finance/markets-page";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: CATEGORY_LABELS[category] ?? "Piyasalar" };
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <MarketsPage category={category} />;
}
