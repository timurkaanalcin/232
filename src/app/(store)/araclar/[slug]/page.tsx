import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/store/favorite-button";
import { FinanceCalculator } from "@/components/store/finance-calculator";
import { AppointmentForm, InquiryForm, ReserveForm } from "@/components/store/lead-forms";
import { VehicleCard } from "@/components/store/vehicle-card";
import { VehicleGallery } from "@/components/store/vehicle-gallery";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCenter, getVehicleBySlug, relatedVehicles } from "@/data/store";
import { BRAND, TRUST } from "@/lib/brand";
import { formatKm, formatTRY } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return { title: "Araç bulunamadı" };
  return {
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
    description: vehicle.description,
  };
}

const FUEL: Record<string, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  hibrit: "Hibrit",
  elektrik: "Elektrik",
  lpg: "LPG",
};

export default async function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();
  const center = getCenter(vehicle.centerId);
  const related = relatedVehicles(vehicle);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm text-slate-500">
        <Link href="/araclar" className="hover:underline">
          Araçlar
        </Link>{" "}
        / {vehicle.brand} / {vehicle.model}
      </p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <VehicleGallery images={vehicle.images} videoUrl={vehicle.videoUrl} />
          <Tabs defaultValue="ozellik" className="mt-8">
            <TabsList>
              <TabsTrigger value="ozellik">Özellikler</TabsTrigger>
              <TabsTrigger value="ekspertiz">Ekspertiz</TabsTrigger>
              <TabsTrigger value="donanim">Donanım</TabsTrigger>
            </TabsList>
            <TabsContent value="ozellik" className="rounded-2xl bg-white p-5 shadow-sm">
              <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <Item label="Yıl" value={String(vehicle.year)} />
                <Item label="Kilometre" value={formatKm(vehicle.km)} />
                <Item label="Yakıt" value={FUEL[vehicle.fuel] ?? vehicle.fuel} />
                <Item label="Vites" value={vehicle.transmission} />
                <Item label="Kasa" value={vehicle.body} />
                <Item label="Renk" value={vehicle.color} />
                <Item label="Motor" value={`${vehicle.engineCc} cc · ${vehicle.powerHp} HP`} />
                <Item label="Çekiş" value={vehicle.drivetrain} />
                <Item label="Kapı / Koltuk" value={`${vehicle.doors} / ${vehicle.seats}`} />
                <Item label="Plaka ili" value={vehicle.plateCity} />
                <Item label="Merkez" value={center?.name ?? vehicle.city} />
                <Item label="Garanti" value={`${vehicle.warrantyMonths} ay`} />
              </dl>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
            </TabsContent>
            <TabsContent value="ekspertiz" className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {vehicle.inspection.technician} · {TRUST.inspectionPoints} kontrol
                  </p>
                  <h2 className="text-xl font-semibold">Ekspertiz skoru {vehicle.inspection.score}</h2>
                </div>
                <Badge className="bg-emerald-600">{vehicle.inspection.score}/100</Badge>
              </div>
              <div className="grid gap-2">
                {vehicle.inspection.items.map((item) => (
                  <div
                    key={`${item.category}-${item.name}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="text-slate-400">{item.category} · </span>
                      {item.name}
                    </span>
                    <span
                      className={
                        item.status === "pass" ? "text-emerald-600" : item.status === "attention" ? "text-amber-600" : "text-red-600"
                      }
                    >
                      {item.status === "pass" ? "Uygun" : item.status === "attention" ? "Dikkat" : "Uygunsuz"}
                      {item.note ? ` · ${item.note}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="donanim" className="rounded-2xl bg-white p-5 shadow-sm">
              <ul className="grid gap-2 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    {feature}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="grid gap-4 self-start">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {vehicle.badge ? <Badge className="bg-amber-500 text-[#0B1F3A]">{vehicle.badge}</Badge> : null}
              <Badge variant="secondary">{vehicle.status === "available" ? "Satışta" : vehicle.status}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-semibold">
              {vehicle.year} {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-slate-500">{vehicle.trim}</p>
            {vehicle.listPrice && vehicle.listPrice > vehicle.price ? (
              <p className="mt-3 text-sm text-slate-400 line-through">{formatTRY(vehicle.listPrice)}</p>
            ) : null}
            <p className="text-3xl font-bold text-[#0B1F3A]">{formatTRY(vehicle.price)}</p>
            <p className="mt-2 text-sm text-slate-600">
              {TRUST.returnDays} gün iade · {TRUST.warrantyMonths} ay garanti · {BRAND.name} teslimat
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <FavoriteButton vehicleId={vehicle.id} />
              <a href={BRAND.phoneHref} className="inline-flex h-9 items-center rounded-md border px-3 text-sm">
                {BRAND.phone}
              </a>
            </div>
          </div>
          {vehicle.status === "available" ? (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Online rezervasyon</h2>
              <ReserveForm vehicleId={vehicle.id} price={vehicle.price} />
            </div>
          ) : null}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Merkezde görün</h2>
            <AppointmentForm vehicleId={vehicle.id} kind="buy" />
          </div>
          <FinanceCalculator price={vehicle.price} />
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Soru sorun</h2>
            <InquiryForm vehicleId={vehicle.id} />
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Benzer araçlar</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <VehicleCard key={item.id} vehicle={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
