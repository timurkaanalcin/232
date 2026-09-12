import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TRUST } from "@/lib/brand";

export const metadata: Metadata = { title: "Nasıl çalışır" };

export default function HowPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-semibold">Nasıl çalışır?</h1>
      <div className="mt-10 grid gap-8">
        <Block title="Alıcılar için" items={[
          "Stoktaki her araç Pista ekspertizinden geçer; rapor ilanla birlikte açılır.",
          "Fiyat sabittir. Online rezervasyon veya merkez randevusu ile ilerlersiniz.",
          `Teslimattan sonra ${TRUST.returnDays} gün iade ve ${TRUST.warrantyMonths} ay mekanik garanti geçerlidir.`,
        ]} />
        <Block title="Satıcılar için" items={[
          "Siteden ön değerleme alın, en yakın merkeze randevu verin.",
          "Ekspertiz yaklaşık 30 dakika sürer; net teklif 2 gün geçerlidir.",
          "Onayda noter ve havale aynı gün tamamlanır. Aracı bırakıp çıkabilirsiniz.",
        ]} />
      </div>
      <div className="mt-10 flex gap-3">
        <Button asChild className="bg-[#0B1F3A]">
          <Link href="/araclar">Araç al</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sat">Araç sat</Link>
        </Button>
      </div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 grid gap-2 text-slate-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
