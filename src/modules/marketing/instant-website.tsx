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
  RadioIcon,
  ShieldCheckIcon,
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
  "Admin komuta merkezi",
  "Risk olay kutusu",
  "İç cüzdan operasyonları",
  "Kullanıcı ve rol yönetimi",
  "Güvenlik izleme",
  "İzin temelli canlı konum",
];

const PLANS = [
  {
    name: "Launch",
    price: "Hızlı başlangıç",
    features: ["Modern vitrin", "Anlık önizleme", "Admin giriş akışı"],
  },
  {
    name: "Operate",
    price: "Operasyon paketi",
    features: ["Risk merkezi", "Cüzdan kontrolü", "Audit ve güvenlik kayıtları"],
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
    <main className="min-h-dvh overflow-hidden bg-[#06110c] text-emerald-50">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[linear-gradient(rgb(16_185_129/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(16_185_129/0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_42%)]" />

      <header className="relative z-10 border-b border-emerald-400/15 bg-black/40 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.2em]">
            <span className="flex size-9 items-center justify-center rounded-sm border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
              <RadioIcon className="size-5" />
            </span>
            CanlıSite
          </Link>
          <nav className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-200/80 md:flex">
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
          <Button asChild className="rounded-sm bg-emerald-400 font-mono text-xs uppercase tracking-[0.14em] text-slate-950 hover:bg-emerald-300">
            <Link href="/login">
              Giriş <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-5 w-fit rounded-sm border-emerald-300/30 bg-emerald-400/10 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200 hover:bg-emerald-400/10">
            <RadioIcon className="size-3.5" />
            Komuta merkezi çevrimiçi
          </Badge>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Modern, hızlı ve yönetilebilir bir platform sitesi.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/75">
            CanlıSite; admin paneli, risk merkezi, cüzdan operasyonları ve izin temelli konum paylaşımını tek
            karanlık komuta arayüzünde birleştiren Next.js tabanlı bir ürün vitrini.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-sm bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <a href="#preview">
                Önizlemeyi kullan <ArrowRightIcon />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-sm border-emerald-400/25 bg-emerald-400/5 text-emerald-50 hover:bg-emerald-400/10">
              <Link href="/admin">Admin paneli</Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-sm border border-emerald-400/15 bg-black/30 p-4">
                <p className="font-mono text-2xl font-black text-emerald-300">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="preview" className="relative">
          <div className="absolute -inset-4 rounded-sm bg-emerald-400/10 blur-3xl" />
          <Card className="relative overflow-hidden border-emerald-400/20 bg-black/45 text-emerald-50 shadow-2xl backdrop-blur">
            <CardHeader className="border-b border-emerald-400/15">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-mono text-sm uppercase tracking-[0.14em]">
                  <GaugeIcon className="size-4 text-emerald-300" />
                  Canlı geliştirme paneli
                </CardTitle>
                <Badge className="rounded-sm bg-emerald-400 font-mono text-[10px] uppercase text-slate-950 hover:bg-emerald-400">
                  Aktif
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5">
              {STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-sm border border-emerald-400/15 bg-[#06110c]/80 p-4">
                  <span className="flex size-8 items-center justify-center rounded-sm bg-emerald-400 font-mono font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="text-sm text-emerald-100">{step}</span>
                </div>
              ))}
              <div className="rounded-sm border border-emerald-300/20 bg-emerald-400/10 p-4 font-mono text-xs uppercase tracking-[0.08em] text-emerald-100">
                Dev server çalıştığında bu sayfayı açık tut; düzenlemeleri kaydettikçe ekran kendini yeniler.
              </div>
              <div className="grid gap-3 rounded-sm border border-emerald-400/15 bg-[#06110c]/80 p-4 text-sm text-emerald-100/80">
                <div className="flex items-center gap-2">
                  <Globe2Icon className="size-4 text-emerald-300" />
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
          <Card key={feature.title} className="border-emerald-400/15 bg-black/35 text-emerald-50 backdrop-blur">
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-sm border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <feature.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm leading-6 text-emerald-100/70">{feature.description}</CardContent>
          </Card>
        ))}
      </section>

      <section id="cozumler" className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-sm border border-emerald-400/15 bg-black/35 p-6 backdrop-blur sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Badge className="mb-3 rounded-sm bg-emerald-400/10 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200 hover:bg-emerald-400/10">
                <GaugeIcon className="size-3.5" />
                Platform kapsamı
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Tek vitrinde ürün, operasyon ve admin deneyimi.</h2>
              <p className="mt-4 text-sm leading-6 text-emerald-100/70">
                Site sadece görsel bir landing page değil; arkasındaki admin, risk ve wallet modüllerini
                anlatan kurumsal bir ürün sunumu olarak tasarlandı.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOLUTIONS.map((solution) => (
                <div key={solution} className="flex items-center gap-3 rounded-sm border border-emerald-400/15 bg-[#06110c]/70 p-4">
                  <CheckCircle2Icon className="size-5 text-emerald-300" />
                  <span className="text-sm text-emerald-100">{solution}</span>
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
            className={`border-emerald-400/15 text-emerald-50 backdrop-blur ${
              plan.highlighted ? "bg-emerald-400 text-slate-950" : "bg-black/35"
            }`}
          >
            <CardHeader>
              <CardTitle className="font-mono text-xl uppercase tracking-[0.08em]">{plan.name}</CardTitle>
              <p className={plan.highlighted ? "text-sm text-slate-800" : "text-sm text-emerald-100/70"}>{plan.price}</p>
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

      <section id="surec" className="relative z-10 border-t border-emerald-400/15 bg-black/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge className="mb-3 rounded-sm bg-emerald-400/10 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100 hover:bg-emerald-400/10">
              <BadgeCheckIcon className="size-3.5" />
              Hazır çalışma akışı
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Artık canlı önizlemeyle çalışabilirsin.</h2>
          </div>
          <div className="grid gap-3 text-sm text-emerald-100/70">
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

      <footer className="relative z-10 border-t border-emerald-400/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 font-mono text-xs uppercase tracking-[0.12em] text-emerald-200/50 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© 2026 CanlıSite. Komuta merkezi ve admin altyapısı.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="hover:text-white">
              Giriş
            </Link>
            <Link href="/gizlilik" className="hover:text-white">
              Gizlilik
            </Link>
            <Link href="/sartlar" className="hover:text-white">
              Şartlar
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
