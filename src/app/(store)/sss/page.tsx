import type { Metadata } from "next";
import { TRUST } from "@/lib/brand";

export const metadata: Metadata = { title: "Sıkça sorulan sorular" };

const FAQ = [
  ["Ekspertiz ücreti var mı?", "Hayır. Hem satış hem alış tarafında ekspertiz Pista tarafından karşılanır."],
  ["İade nasıl işler?", `${TRUST.returnDays} gün veya 500 km içinde, teslim koşullarına uygun araçlar iade edilebilir.`],
  ["Finansman zorunlu mu?", "Hayır. Peşin, havale veya anlaşmalı banka kredisi kullanabilirsiniz."],
  ["Hangi araçlar alınır?", "Genelde 2010 ve sonrası, 200.000 km altı, ağır hasarsız binek ve SUV’lar."],
  ["Ödeme ne zaman yatar?", `Satış onayından sonra hedef ${TRUST.payoutHours} saattir.`],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold">Sıkça sorulan sorular</h1>
      <div className="mt-8 grid gap-4">
        {FAQ.map(([q, a]) => (
          <article key={q} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{q}</h2>
            <p className="mt-2 text-sm text-slate-600">{a}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
