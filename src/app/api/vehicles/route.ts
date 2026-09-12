import { NextResponse } from "next/server";
import { filterVehicles } from "@/data/store";
import type { BodyType, FuelType, TransmissionType, VehicleFilters } from "@/types/marketplace";

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: VehicleFilters = {
    q: url.searchParams.get("q") ?? undefined,
    brand: url.searchParams.get("brand") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
    fuel: (url.searchParams.get("fuel") as FuelType) || undefined,
    transmission: (url.searchParams.get("transmission") as TransmissionType) || undefined,
    body: (url.searchParams.get("body") as BodyType) || undefined,
    yearMin: num(url.searchParams.get("yearMin")),
    yearMax: num(url.searchParams.get("yearMax")),
    priceMin: num(url.searchParams.get("priceMin")),
    priceMax: num(url.searchParams.get("priceMax")),
    kmMax: num(url.searchParams.get("kmMax")),
    sort: (url.searchParams.get("sort") as VehicleFilters["sort"]) || undefined,
    page: num(url.searchParams.get("page")),
    pageSize: num(url.searchParams.get("pageSize")),
  };
  return NextResponse.json(filterVehicles(filters));
}
