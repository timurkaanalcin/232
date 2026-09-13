import type { Metadata } from "next";
import { VehicleCard } from "@/components/store/vehicle-card";
import { VehicleFilters } from "@/components/store/vehicle-filters";
import { filterVehicles } from "@/data/store";
import { BRAND } from "@/lib/brand";
import type { BodyType, FuelType, TransmissionType, VehicleFilters as Filters } from "@/types/marketplace";

export const metadata: Metadata = {
  title: "Satılık ikinci el araçlar",
  description: `${BRAND.name} stokundaki ekspertizli ikinci el araçları filtreleyin.`,
};

function num(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const get = (key: string) => (typeof raw[key] === "string" ? raw[key] : undefined);
  const filters: Filters = {
    q: get("q"),
    brand: get("brand"),
    city: get("city"),
    fuel: get("fuel") as FuelType | undefined,
    transmission: get("transmission") as TransmissionType | undefined,
    body: get("body") as BodyType | undefined,
    yearMin: num(get("yearMin")),
    yearMax: num(get("yearMax")),
    priceMax: num(get("priceMax")),
    kmMax: num(get("kmMax")),
    sort: (get("sort") as Filters["sort"]) ?? "newest",
    page: num(get("page")) ?? 1,
    pageSize: 12,
  };
  const { items, total } = filterVehicles(filters);
  const values = Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, v == null ? undefined : String(v)]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <p className="text-sm text-amber-700">Pista stok</p>
        <h1 className="text-3xl font-semibold">Satılık ikinci el araçlar</h1>
        <p className="mt-2 text-slate-600">{total} araç bulundu. Tüm ilanlar 240 puanlık kontrolden geçti.</p>
      </div>
      <VehicleFilters values={values} />
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center text-slate-600">
          Bu filtrelere uyan araç yok. Filtreleri genişletmeyi deneyin.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
