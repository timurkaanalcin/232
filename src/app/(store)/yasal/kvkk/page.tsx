import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "KVKK aydınlatma" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">KVKK aydınlatma metni</h1>
      <p className="mt-6 text-slate-700">
        {BRAND.legalName}, formlar aracılığıyla toplanan ad, iletişim ve araç bilgilerini değerleme, randevu ve satış
        süreçlerini yürütmek için işler. Verileriniz üçüncü kişilere pazarlama amacıyla satılmaz. Başvuru için{" "}
        {BRAND.email} adresine yazabilirsiniz.
      </p>
    </article>
  );
}
