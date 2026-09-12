import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/modules/finance/search-page";

export const metadata: Metadata = { title: "Arama" };

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor…</p>}>
      <SearchPage />
    </Suspense>
  );
}
