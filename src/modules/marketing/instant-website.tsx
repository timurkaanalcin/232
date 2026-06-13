import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  GaugeIcon,
  Layers3Icon,
  MonitorSmartphoneIcon,
  RocketIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: MonitorSmartphoneIcon,
    title: "Responsive tasarım",
    description: "Telefon, tablet ve masaüstünde temiz görünen modern bir arayüz.",
  },
  {
    icon: ZapIcon,
    title: "Anında güncelleme",
    description: "Geliştirme sunucusu çalışırken kaydettiğin değişiklikler otomatik yenilenir.",
  },
  {
    icon: Layers3Icon,
    title: "Büyümeye hazır yapı",
    description: "Next.js, TypeScript ve Tailwind ile yeni sayfalar hızla eklenebilir.",
  },
];

const STEPS = [
  "İçeriği düzenle",
  "Dosyayı kaydet",
  "Tarayıcıda anında gör",
];

export function InstantWebsite() {
  return (
    <main className="min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.24),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)]" />

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
            <a href="#surec" className="hover:text-white">
              Süreç
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
            Hot reload hazır
          </Badge>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Değiştir, kaydet, web sitesini anında gör.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Bu site canlı geliştirme için hazırlandı. Kodda yaptığın her değişiklik Next.js geliştirme
            sunucusu tarafından algılanır ve tarayıcıdaki önizleme otomatik güncellenir.
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
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="ozellikler" className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3">
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
    </main>
  );
}
