import type { Metadata } from "next";
import { FinanceCalculator } from "@/components/store/finance-calculator";
import { InquiryForm } from "@/components/store/lead-forms";

export const metadata: Metadata = { title: "Finansman" };

export default function FinancePage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-semibold">Taşıt finansmanı</h1>
        <p className="mt-4 text-slate-600">
          Anlaşmalı bankalarla peşinat ve vade seçeneklerini önceden görün. Başvuru Pista danışmanı tarafından iletilir; onay bankaya aittir.
        </p>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700">
          <li>• 12–48 ay vade seçenekleri</li>
          <li>• Peşinat %0’dan başlayan kampanya dönemleri</li>
          <li>• Bireysel ve ticari başvuru</li>
        </ul>
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Başvuru bırakın</h2>
          <InquiryForm />
        </div>
      </div>
      <FinanceCalculator price={1_500_000} />
    </div>
  );
}
