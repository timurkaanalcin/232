import type { Metadata } from "next";
import { TRUST } from "@/lib/brand";

export const metadata: Metadata = { title: "Garanti ve iade" };

export default function WarrantyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold">Garanti ve 14 gün iade</h1>
      <div className="mt-8 grid gap-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{TRUST.returnDays} gün düşünme süresi</h2>
          <p className="mt-3 text-slate-600">
            Teslimattan itibaren {TRUST.returnDays} gün veya 500 km (hangisi önce dolarsa) içinde aracı iade edebilirsiniz. Araç
            teslim alındığı donanım ve hasarsızlık koşullarında olmalıdır.
          </p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{TRUST.warrantyMonths} ay Pista garantisi</h2>
          <p className="mt-3 text-slate-600">
            Motor, şanzıman, diferansiyel ve temel elektronik aksam bu süre boyunca Pista güvencesindedir. Lastik, balata,
            silecek gibi sarf malzemeler kapsam dışıdır.
          </p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Ekspertiz şeffaflığı</h2>
          <p className="mt-3 text-slate-600">
            {TRUST.inspectionPoints} maddelik rapor her ilanda yayındadır. Satın almadan önce dikkat maddelerini okuyun.
          </p>
        </section>
      </div>
    </div>
  );
}
