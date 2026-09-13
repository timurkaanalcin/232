import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Kullanım koşulları" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose-sm">
      <h1 className="text-3xl font-semibold">Kullanım koşulları</h1>
      <p className="mt-6 text-slate-700">
        Bu site {BRAND.legalName} tarafından işletilir. Online değerleme ön tekliftir; bağlayıcı satış ancak fiziksel
        inceleme ve yazılı onay sonrası oluşur. Stoktaki araçlar rezerve edilene kadar satışa açıktır.
      </p>
    </article>
  );
}
