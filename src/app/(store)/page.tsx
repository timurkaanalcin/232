import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheckIcon,
  ClockIcon,
  HandshakeIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";
import { VehicleCard } from "@/components/store/vehicle-card";
import { Button } from "@/components/ui/button";
import { HERO_POSTER, HERO_VIDEO } from "@/data/catalog";
import { filterVehicles } from "@/data/store";
import { BRAND, TRUST } from "@/lib/brand";
import { formatNumber } from "@/lib/money";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
};

const STEPS = [
  {
    title: "Araçları incele",
    text: "240 puanlık ekspertiz raporu, gerçek fotoğraflar ve şeffaf fiyatla stoku gezin.",
  },
  {
    title: "Rezerve et veya gel görün",
    text: "Online ön ödeme ile rezerve edin ya da en yakın Pista merkezinde test sürün.",
  },
  {
    title: "Güvenle teslim alın",
    text: "Noter, ödeme ve teslimat aynı günde. 14 gün içinde iade hakkınız saklı.",
  },
];

const PROMISES = [
  { icon: BadgeCheckIcon, title: `${TRUST.inspectionPoints} puan ekspertiz`, text: "Kaporta, mekanik, elektronik ve belge kontrolü." },
  { icon: RefreshCcwIcon, title: `${TRUST.returnDays} gün iade`, text: "Beğenmezseniz koşullar dahilinde iade edin." },
  { icon: ShieldCheckIcon, title: `${TRUST.warrantyMonths} ay garanti`, text: "Motor, şanzıman ve elektrik aksamı güvence altında." },
  { icon: TruckIcon, title: `${TRUST.deliveryHours} saat teslimat`, text: "Merkezden teslim veya anlaşmalı evde teslimat." },
  { icon: HandshakeIcon, title: "Sabit fiyat", text: "Pazarlıksız, ekspertize dayalı net satış fiyatı." },
  { icon: ClockIcon, title: `${TRUST.payoutHours} saatte ödeme`, text: "Aracınızı sattığınızda bedel aynı gün hesabınızda." },
];

export default function HomePage() {
  const featured = filterVehicles({ featured: true, status: "available", pageSize: 8 });
  const latest = filterVehicles({ sort: "newest", status: "available", pageSize: 8 });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0B1F3A] text-white">
        <video
          className="absolute inset-0 size-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/80 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-300">İkinci el, birinci sınıf</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight md:text-6xl">
              Güvenilir ikinci el.
              <span className="text-amber-300"> Tek adres.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/75">{BRAND.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-amber-500 text-[#0B1F3A] hover:bg-amber-400" asChild>
                <Link href="/araclar">Araçları gör</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10" asChild>
                <Link href="/sat">Aracını değerle</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-white/50">Stok</dt>
                <dd className="text-2xl font-semibold">{formatNumber(featured.total + 16)}+</dd>
              </div>
              <div>
                <dt className="text-white/50">Ekspertiz</dt>
                <dd className="text-2xl font-semibold">{TRUST.inspectionPoints}</dd>
              </div>
              <div>
                <dt className="text-white/50">İade</dt>
                <dd className="text-2xl font-semibold">{TRUST.returnDays} gün</dd>
              </div>
            </dl>
          </div>
          <HomeSearchCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="text-sm font-semibold text-amber-600">0{i + 1}</span>
              <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Öne çıkan araçlar</h2>
            <p className="text-sm text-slate-600">Ekspertizi tamamlanmış, teslime hazır stok</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/araclar">Tümünü gör</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured.items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <h2 className="text-2xl font-semibold">Pista sözü</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <item.icon className="mt-0.5 size-6 text-amber-600" />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <h2 className="text-2xl font-semibold">Yeni eklenenler</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {latest.items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="mx-auto my-16 max-w-7xl overflow-hidden rounded-3xl bg-[#0B1F3A] px-6 py-12 text-white md:px-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">Aracını 30 dakikada sat</h2>
          <p className="mt-3 text-white/70">
            Online ön değerleme alın, merkeze gelin, ekspertiz sonrası net teklifi görün. Kabul ederseniz noter ve ödeme aynı gün.
          </p>
          <Button size="lg" className="mt-6 bg-amber-500 text-[#0B1F3A] hover:bg-amber-400" asChild>
            <Link href="/sat">Ücretsiz değerleme başlat</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function HomeSearchCard() {
  return (
    <form action="/araclar" className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
      <h2 className="text-lg font-semibold">Hangi aracı arıyorsun?</h2>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-500">Arama</span>
          <input
            name="q"
            placeholder="Marka, model veya şehir"
            className="h-11 rounded-lg border border-slate-200 px-3"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-500">Min. yıl</span>
            <input name="yearMin" type="number" placeholder="2018" className="h-11 rounded-lg border border-slate-200 px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-500">Maks. fiyat</span>
            <input name="priceMax" type="number" placeholder="1500000" className="h-11 rounded-lg border border-slate-200 px-3" />
          </label>
        </div>
        <Button type="submit" className="h-11 bg-[#0B1F3A] hover:bg-[#122a4d]">
          Araçları getir
        </Button>
      </div>
    </form>
  );
}
