import type { Metadata } from "next";
import { BRAND, TRUST } from "@/lib/brand";

export const metadata: Metadata = { title: "Hakkımızda" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold">{BRAND.legalName}</h1>
      <p className="mt-6 text-lg text-slate-700">{BRAND.description}</p>
      <p className="mt-4 text-slate-600">
        Pista, VavaCars veya başka bir markanın kopyası değildir. Şeffaf ekspertiz, sabit fiyat ve hızlı teslimat vaadiyle
        Türkiye’de güvenilir bir ikinci el deneyimi sunmak için tasarlanmış bağımsız bir platformdur.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <dt className="text-sm text-slate-500">Ekspertiz</dt>
          <dd className="text-2xl font-semibold">{TRUST.inspectionPoints} puan</dd>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <dt className="text-sm text-slate-500">İade</dt>
          <dd className="text-2xl font-semibold">{TRUST.returnDays} gün</dd>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <dt className="text-sm text-slate-500">Garanti</dt>
          <dd className="text-2xl font-semibold">{TRUST.warrantyMonths} ay</dd>
        </div>
      </dl>
    </div>
  );
}
