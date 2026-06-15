import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  DownloadIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { SITE_NAME } from "@/modules/marketing/news-articles";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Kurumsal yatırım ve trading operasyon platformu`,
  description:
    "Yatırım müşteri yönetimi, broker bağlantısı, CRM operasyonları, uyum süreçleri ve trading terminali için kurumsal platform.",
  openGraph: {
    title: SITE_NAME,
    description: "Yatırım kurumu operasyonları için CRM, canlı broker terminali ve uyum altyapısı.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

const features = [
  {
    icon: UsersIcon,
    title: "Yatırım müşteri merkezi",
    description: "Her müşteri için rakamsal ID, yatırım profili, iletişim bilgileri, kaynak ve sorumlu ekip ataması.",
  },
  {
    icon: TargetIcon,
    title: "Müşteri kabul pipeline'ı",
    description: "Lead, potansiyel yatırımcı, depozitör ve aktif müşteri akışlarını tek merkezden izleyin.",
  },
  {
    icon: CalendarClockIcon,
    title: "Bölgesel takip zamanı",
    description: "Türkiye, Rusya, Almanya ve diğer bölgelerde çalışanların saat dilimine göre takip planlayın.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Kurumsal yetki hiyerarşisi",
    description: "Admin, Shift şirketleri, Head, Team Leader, Sale, Retention ve müşteri rollerini ayırın.",
  },
  {
    icon: BarChart3Icon,
    title: "Yatırım operasyon KPI'ları",
    description: "Müşteri kazanımı, yatırım hacmi, broker emirleri, ekip performansı ve takip özetlerini görün.",
  },
  {
    icon: DownloadIcon,
    title: "Uyum ve raporlama",
    description: "Müşteri, işlem, belge ve iletişim kayıtlarını raporlama süreçleri için dışa aktarın.",
  },
];

const stats = [
  { label: "Yetki seviyesi", value: "8" },
  { label: "Müşteri statüsü", value: "16" },
  { label: "Broker modu", value: "Live" },
  { label: "Uyum modülü", value: "KYC" },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_35%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Özellikler
          </a>
          <a href="#roles" className="hover:text-foreground">
            Yetkiler
          </a>
          <Link href="/kurumsal" className="hover:text-foreground">
            Kurumsal
          </Link>
          <Link href="/risk-bildirimi" className="hover:text-foreground">
            Risk Bildirimi
          </Link>
          <a href="#platform" className="hover:text-foreground">
            Platform
          </a>
        </nav>
        <Button asChild>
          <Link href="/login">
            Panele giriş <ArrowRightIcon />
          </Link>
        </Button>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="grid gap-6">
          <Badge variant="secondary" className="w-fit px-3 py-1">
            Kurumsal Yatırım Platformu
          </Badge>
          <div className="grid gap-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Kendi yatırım kurumunuz gibi çalışan uçtan uca operasyon sistemi.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Shift şirket yapısı, müşteri kabul süreçleri, canlı broker terminali, KYC/uyum kayıtları
              ve ekip yetkilerini tek bir profesyonel platformda yönetin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Canlı panele gir <ArrowRightIcon />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admin/users">Yönetim paneli</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admin/trading">Trading terminali</Link>
            </Button>
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border bg-background/70 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-background/85 shadow-2xl backdrop-blur">
          <CardContent className="grid gap-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Institutional Overview</p>
                <h2 className="text-xl font-semibold">Yatırım operasyonu</h2>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Aktif müşteri", "128"],
                ["Bekleyen KYC", "14"],
                ["Broker emri", "52"],
                ["Risk uyarısı", "3"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-3xl font-semibold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3">
              {[
                ["Yatırımcı Kabul", "Onboarding", "65%"],
                ["Retention", "Active", "48%"],
                ["Broker Bağlantısı", "Live Ready", "72%"],
              ].map(([label, value, width]) => (
                <div key={label} className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="features" className="mx-auto grid w-full max-w-7xl gap-5 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-background/80">
            <CardContent className="grid gap-4 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="roles" className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Yatırım kurumuna uygun yetki modeli</h2>
          <p className="mt-3 text-muted-foreground">
            Admin yalnızca Shift şirketlerini yönetir. Her Shift kendi şirketini, Head ve takım liderleri
            üzerinden Sale, Retention ve müşteri operasyonlarını yönetir.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {["Admin", "Shift Şirketi", "Head", "Team Leader", "Sale", "Retention", "Müşteri"].map((role) => (
            <div key={role} className="flex items-center gap-2 rounded-xl border bg-background/80 p-4">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span className="font-medium">{role}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="rounded-3xl border bg-primary p-8 text-primary-foreground shadow-xl md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold">Yatırım platformunuzu yönetin</h2>
              <p className="mt-2 text-primary-foreground/80">
                Kurumsal yatırım operasyonu, müşteri kabulü, canlı broker emir akışı, KYC ve ekip
                hiyerarşisini tek panelden kontrol edin.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">
                Giriş yap <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
