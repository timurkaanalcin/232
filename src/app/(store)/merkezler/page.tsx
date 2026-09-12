import type { Metadata } from "next";
import { AppointmentForm } from "@/components/store/lead-forms";
import { listCenters } from "@/data/store";

export const metadata: Metadata = { title: "Müşteri merkezleri" };

export default function CentersPage() {
  const centers = listCenters();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-semibold">Müşteri merkezleri</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Ekspertiz, teslimat ve satış işlemleri merkezlerimizde tamamlanır. Randevusuz ziyarette bekleme olabilir.
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {centers.map((center) => (
            <article key={center.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{center.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {center.district} / {center.city}
              </p>
              <p className="mt-3 text-sm">{center.address}</p>
              <p className="mt-2 text-sm text-slate-600">
                {center.phone} · {center.hours}
              </p>
              <p className="mt-3 text-xs text-slate-500">{center.services.join(" · ")}</p>
            </article>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Randevu al</h2>
          <AppointmentForm kind="sell" />
        </div>
      </div>
    </div>
  );
}
