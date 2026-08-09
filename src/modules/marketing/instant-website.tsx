import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BarChart3Icon,
  Building2Icon,
  CheckCircle2Icon,
  CreditCardIcon,
  GaugeIcon,
  Globe2Icon,
  Layers3Icon,
  MonitorSmartphoneIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: BarChart3Icon,
    title: "Canlı dashboard",
    description: "Satış, kullanıcı, risk ve operasyon metriklerini tek panelde takip et.",
  },
  {
    icon: CreditCardIcon,
    title: "Cüzdan altyapısı",
    description: "Freeze, transfer, reversal ve işlem geçmişi için kontrollü yönetim ekranları.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Risk & compliance",
    description: "Uyarıları filtrele, onayla, çöz ve tüm aksiyonları audit log ile izle.",
  },
  {
    icon: MonitorSmartphoneIcon,
    title: "Responsive deneyim",
    description: "Telefon, tablet ve masaüstünde premium görünüm için optimize edildi.",
  },
  {
    icon: ZapIcon,
    title: "Anında önizleme",
    description: "Kod değişikliklerini kaydettiğinde sayfa hot reload ile yenilenir.",
  },
  {
    icon: Layers3Icon,
    title: "Modüler yapı",
    description: "Yeni sayfalar, modüller ve API uçları mevcut mimariye kolayca eklenir.",
  },
];

const STEPS = [
  "Yeni içerik veya modül ekle",
  "Dosyayı kaydet",
  "Tarayıcıda anında güncel halini gör",
];

const STATS = [
  { label: "Admin modülü", value: "12+" },
  { label: "API uç noktası", value: "40+" },
  { label: "Canlı yenileme", value: "<1 sn" },
  { label: "Audit kapsamı", value: "100%" },
];

const SOLUTIONS = [
  "Admin command center",
  "Risk event inbox",
  "Internal wallet operations",
  "User and role management",
  "Security monitoring",
  "Live preview website",
];

const PLANS = [
  {
    name: "Launch",
    price: "Hızlı başlangıç",
    features: ["Modern landing page", "Hot reload preview", "Admin giriş akışı"],
  },
  {
    name: "Operate",
    price: "Operasyon paketi",
    features: ["Risk merkezi", "Wallet control plane", "Audit & security logs"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Büyüme altyapısı",
    features: ["Çoklu modül mimarisi", "Yeni API entegrasyonları", "Kurumsal raporlama"],
  },
];

export function InstantWebsite() {
  return (
    <main className="min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.24),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)]" />

      <header className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
              <SparklesIcon className="size-5" />
            </span>
            CanlıSite
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#ozellikler" className="hover:text-white">
              Özellikler
            </a>
            <a href="#cozumler" className="hover:text-white">
              Çözümler
            </a>
            <a href="#paketler" className="hover:text-white">
              Paketler
            </a>
            <a href="#preview" className="hover:text-white">
              Canlı önizleme
            </a>
          </nav>
          <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
            <Link href="/login">
              Giriş <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-5 w-fit border-emerald-300/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
            <RocketIcon className="size-3.5" />
            Kurumsal canlı web deneyimi
          </Badge>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Modern, hızlı ve yönetilebilir bir platform sitesi.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            CanlıSite; admin paneli, risk merkezi, cüzdan operasyonları ve anında önizleme akışını tek
            modern arayüzde birleştiren Next.js tabanlı bir ürün vitrini.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <a href="#preview">
                Önizlemeyi kullan <ArrowRightIcon />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/admin">Admin paneli</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-black text-emerald-300">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="preview" className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-emerald-400/20 blur-3xl" />
          <Card className="relative overflow-hidden border-white/10 bg-white/[0.06] text-white shadow-2xl backdrop-blur">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GaugeIcon className="size-4 text-emerald-300" />
                  Canlı geliştirme paneli
                </CardTitle>
                <Badge className="bg-emerald-400 text-slate-950 hover:bg-emerald-400">Aktif</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5">
              {STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-400 font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-200">{step}</span>
                </div>
              ))}
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Dev server çalıştığında bu sayfayı açık tut; düzenlemeleri kaydettikçe ekran kendini yeniler.
              </div>
              <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Globe2Icon className="size-4 text-blue-300" />
                  <span>Landing page: /</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon className="size-4 text-emerald-300" />
                  <span>Admin panel: /admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-amber-300" />
                  <span>Kullanıcı girişi: /login</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="ozellikler" className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="border-white/10 bg-white/[0.05] text-white backdrop-blur">
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <feature.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm leading-6 text-slate-300">{feature.description}</CardContent>
          </Card>
        ))}
      </section>

      <section id="cozumler" className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Badge className="mb-3 bg-blue-400/10 text-blue-200 hover:bg-blue-400/10">
                <GaugeIcon className="size-3.5" />
                Platform kapsamı
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Tek vitrinde ürün, operasyon ve admin deneyimi.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Site sadece görsel bir landing page değil; arkasındaki admin, risk ve wallet modüllerini
                anlatan kurumsal bir ürün sunumu olarak tasarlandı.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOLUTIONS.map((solution) => (
                <div key={solution} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <CheckCircle2Icon className="size-5 text-emerald-300" />
                  <span className="text-sm text-slate-200">{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paketler" className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`border-white/10 text-white backdrop-blur ${
              plan.highlighted ? "bg-emerald-400 text-slate-950" : "bg-white/[0.05]"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className={plan.highlighted ? "text-sm text-slate-800" : "text-sm text-slate-300"}>{plan.price}</p>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <BadgeCheckIcon className="size-4" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="surec" className="relative z-10 border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge className="mb-3 bg-white/10 text-white hover:bg-white/10">
              <BadgeCheckIcon className="size-3.5" />
              Hazır çalışma akışı
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Artık canlı önizlemeyle çalışabilirsin.</h2>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <p>
              Terminalde çalışan geliştirme sunucusu dosya değişikliklerini izler. Sen bir dosyayı
              değiştirdiğinde Next.js ilgili sayfayı yeniden derler.
            </p>
            <p>
              Bu yapı yeni bölümler, renkler, metinler veya sayfalar eklerken hızlı görsel geri bildirim
              alman için hazırlandı.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2026 CanlıSite. Modern web sitesi ve admin altyapısı.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white">
              Giriş
            </Link>
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
