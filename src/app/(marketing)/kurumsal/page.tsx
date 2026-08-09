import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRightIcon, Building2Icon, CheckCircle2Icon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Kurumsal",
  description: "ALS Yatırım kurumsal yatırım operasyon platformu.",
};

const principles = [
  "Şirket bazlı Shift organizasyonu",
  "KYC, belge ve müşteri kabul süreçleri",
  "Canlı broker bağlantısına hazır trading terminali",
  "Sale ve Retention ekipleri için ayrılmış operasyon akışları",
];

const cards: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: UsersIcon,
    title: "Organizasyon",
    description: "Admin, Shift şirketi, Head, Team Leader, Sale, Retention ve müşteri rolleri.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Uyum",
    description: "KYC, belge, müşteri notları ve işlem kayıtları merkezi biçimde tutulur.",
  },
  {
    icon: Building2Icon,
    title: "Broker-ready",
    description: "Lisanslı broker API bilgileri girildiğinde canlı emir akışına hazırdır.",
  },
];

export default function CorporatePage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Button asChild>
          <Link href="/login">
            Panele giriş <ArrowRightIcon />
          </Link>
        </Button>
      </header>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2Icon className="size-7" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Kurumsal yatırım operasyon altyapısı</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            ALS Yatırım; müşteri kabul, ekip hiyerarşisi, yatırım operasyonları, canlı broker bağlantısı,
            belge yönetimi ve müşteri destek süreçlerini tek kurumsal platformda toplar.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4 p-6">
            {principles.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border p-4">
                <CheckCircle2Icon className="size-5 text-primary" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="grid gap-3 p-6">
              <card.icon className="size-6 text-primary" />
              <h2 className="font-semibold">{card.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
