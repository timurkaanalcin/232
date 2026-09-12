import type { Metadata } from "next";
import { ValuationWizard } from "@/components/store/valuation-wizard";
import { BRAND, TRUST } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Aracını sat",
  description: "Ücretsiz online değerleme alın, merkeze gelin, aynı gün ödeme alın.",
};

export default function SellPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-medium text-amber-700">Satış</p>
        <h1 className="mt-2 text-4xl font-semibold">Aracını 30 dakikada sat</h1>
        <ol className="mt-6 grid gap-4 text-sm text-slate-700">
          <li>
            <strong>1. Online ön değerleme</strong> — yıl, marka, km ve durum bilgisiyle 7 gün geçerli aralık.
          </li>
          <li>
            <strong>2. Merkez randevusu</strong> — {TRUST.inspectionPoints} puanlık ekspertiz, şeffaf rapor.
          </li>
          <li>
            <strong>3. Net teklif ve ödeme</strong> — kabul ederseniz noter aynı gün, bedel {TRUST.payoutHours} saatte hesabınızda.
          </li>
        </ol>
        <p className="mt-6 text-sm text-slate-500">
          2009 öncesi, ağır hasarlı veya 200.000 km üzeri araçlar için değerleme yapılmayabilir. Destek: {BRAND.phone}
        </p>
      </div>
      <ValuationWizard />
    </div>
  );
}
