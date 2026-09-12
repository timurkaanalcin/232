import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePage } from "@/modules/finance/compare-page";

export const metadata: Metadata = { title: "Karşılaştır" };

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor…</p>}>
      <ComparePage />
    </Suspense>
  );
}
