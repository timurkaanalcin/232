"use client";

import { useRouter } from "next/navigation";
import { BRANDS, CITIES } from "@/data/catalog";

const FUELS = [
  { value: "", label: "Yakıt" },
  { value: "benzin", label: "Benzin" },
  { value: "dizel", label: "Dizel" },
  { value: "hibrit", label: "Hibrit" },
  { value: "elektrik", label: "Elektrik" },
  { value: "lpg", label: "LPG" },
];

const GEARS = [
  { value: "", label: "Vites" },
  { value: "otomatik", label: "Otomatik" },
  { value: "manuel", label: "Manuel" },
];

const BODIES = [
  { value: "", label: "Kasa" },
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "suv", label: "SUV" },
  { value: "crossover", label: "Crossover" },
];

const SORTS = [
  { value: "newest", label: "Önerilen" },
  { value: "price_asc", label: "Fiyat artan" },
  { value: "price_desc", label: "Fiyat azalan" },
  { value: "km_asc", label: "KM artan" },
  { value: "year_desc", label: "Yıl yeni" },
];

export function VehicleFilters({ values }: { values: Record<string, string | undefined> }) {
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    router.push(`/araclar?${params.toString()}`);
  }

  const selectClass = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <input
        name="q"
        defaultValue={values.q}
        placeholder="Marka, model, şehir…"
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <select name="brand" defaultValue={values.brand ?? ""} className={selectClass}>
          <option value="">Marka</option>
          {BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        <select name="city" defaultValue={values.city ?? ""} className={selectClass}>
          <option value="">Şehir</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select name="fuel" defaultValue={values.fuel ?? ""} className={selectClass}>
          {FUELS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select name="transmission" defaultValue={values.transmission ?? ""} className={selectClass}>
          {GEARS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select name="body" defaultValue={values.body ?? ""} className={selectClass}>
          {BODIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={values.sort ?? "newest"} className={selectClass}>
          {SORTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input name="yearMin" defaultValue={values.yearMin} placeholder="Min yıl" className={selectClass} />
        <input name="yearMax" defaultValue={values.yearMax} placeholder="Maks yıl" className={selectClass} />
        <input name="priceMax" defaultValue={values.priceMax} placeholder="Maks fiyat" className={selectClass} />
        <input name="kmMax" defaultValue={values.kmMax} placeholder="Maks km" className={selectClass} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-lg bg-[#0B1F3A] px-4 text-sm font-medium text-white">
          Filtrele
        </button>
        <a href="/araclar" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm">
          Temizle
        </a>
      </div>
    </form>
  );
}
