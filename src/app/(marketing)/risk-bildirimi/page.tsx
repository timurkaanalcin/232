import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangleIcon, ArrowLeftIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Risk Bildirimi",
  description: "Yatırım işlemleri risk bildirimi ve broker entegrasyonu uyarıları.",
};

const notices = [
  "Kaldıraçlı işlemler, CFD, forex, kripto ve türev ürünler yüksek risk içerir.",
  "Gerçek emir iletimi yalnızca lisanslı broker API bilgileri yapılandırıldığında çalışır.",
  "Platform tek başına aracı kurum lisansı sağlamaz; lisans, sözleşme ve mevzuat süreçleri kurum sorumluluğundadır.",
  "Müşteri kabul, KYC, uygunluk testi ve risk profili süreçleri kurum tarafından işletilmelidir.",
];

export default function RiskDisclosurePage() {
  return (
    <main className="min-h-dvh bg-muted/30">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeftIcon /> Ana sayfa
          </Link>
        </Button>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="grid gap-5 p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <ShieldAlertIcon className="size-7" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-amber-950">Risk Bildirimi</h1>
                <p className="mt-2 leading-7 text-amber-900/80">
                  ALS Yatırım platformu kurumsal operasyon, CRM ve broker entegrasyonu altyapısıdır.
                  Gerçek yatırım hizmeti sunumu için ilgili lisans, sözleşme, saklama, emir iletim ve mevzuat
                  süreçlerinin tamamlanması gerekir.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {notices.map((notice) => (
                <div key={notice} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white/70 p-4">
                  <AlertTriangleIcon className="mt-0.5 size-5 text-amber-600" />
                  <p className="text-sm leading-6 text-amber-950">{notice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
