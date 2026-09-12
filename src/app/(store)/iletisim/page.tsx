import type { Metadata } from "next";
import { InquiryForm } from "@/components/store/lead-forms";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-4xl font-semibold">İletişim</h1>
        <ul className="mt-6 grid gap-2 text-slate-700">
          <li>Telefon: {BRAND.phone}</li>
          <li>E-posta: {BRAND.email}</li>
          <li>Çalışma: {BRAND.hours}</li>
        </ul>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <InquiryForm />
      </div>
    </div>
  );
}
