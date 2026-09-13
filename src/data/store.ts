import { randomUUID } from "crypto";
import { CENTERS, VEHICLES } from "@/data/catalog";
import { estimateValuation, type ValuationInput } from "@/data/valuation";
import type {
  Appointment,
  Center,
  Favorite,
  Inquiry,
  MarketplaceStats,
  Reservation,
  Valuation,
  Vehicle,
  VehicleFilters,
} from "@/types/marketplace";

interface MemoryState {
  vehicles: Vehicle[];
  centers: Center[];
  valuations: Valuation[];
  appointments: Appointment[];
  inquiries: Inquiry[];
  reservations: Reservation[];
  favorites: Favorite[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

const memory: MemoryState = {
  vehicles: clone(VEHICLES),
  centers: clone(CENTERS),
  valuations: [],
  appointments: [],
  inquiries: [],
  reservations: [],
  favorites: [],
};

export function listCenters(): Center[] {
  return clone(memory.centers);
}

export function getCenter(id: string): Center | undefined {
  return memory.centers.find((c) => c.id === id);
}

export function filterVehicles(filters: VehicleFilters = {}): { items: Vehicle[]; total: number } {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  let items = memory.vehicles.filter((v) => {
    if (filters.status) {
      if (v.status !== filters.status) return false;
    } else if (v.status === "draft") {
      return false;
    }
    if (filters.featured && !v.featured) return false;
    if (filters.brand && v.brand !== filters.brand) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.city && v.city !== filters.city) return false;
    if (filters.fuel && v.fuel !== filters.fuel) return false;
    if (filters.transmission && v.transmission !== filters.transmission) return false;
    if (filters.body && v.body !== filters.body) return false;
    if (filters.yearMin && v.year < filters.yearMin) return false;
    if (filters.yearMax && v.year > filters.yearMax) return false;
    if (filters.priceMin && v.price < filters.priceMin) return false;
    if (filters.priceMax && v.price > filters.priceMax) return false;
    if (filters.kmMax && v.km > filters.kmMax) return false;
    if (filters.q) {
      const q = filters.q.toLocaleLowerCase("tr");
      const hay = `${v.brand} ${v.model} ${v.trim} ${v.city} ${v.color} ${v.year}`.toLocaleLowerCase("tr");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "km_asc":
      items.sort((a, b) => a.km - b.km);
      break;
    case "year_desc":
      items.sort((a, b) => b.year - a.year || a.km - b.km);
      break;
    default:
      items.sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt);
  }

  const total = items.length;
  items = items.slice((page - 1) * pageSize, page * pageSize);
  return { items: clone(items), total };
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return memory.vehicles.find((v) => v.slug === slug);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return memory.vehicles.find((v) => v.id === id);
}

export function relatedVehicles(vehicle: Vehicle, limit = 4): Vehicle[] {
  return memory.vehicles
    .filter((v) => v.id !== vehicle.id && v.status === "available")
    .sort((a, b) => {
      const score = (x: Vehicle) =>
        (x.brand === vehicle.brand ? 3 : 0) + (x.body === vehicle.body ? 2 : 0) + (x.city === vehicle.city ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function createVehicle(input: Vehicle): Vehicle {
  memory.vehicles.unshift(input);
  return clone(input);
}

export function updateVehicle(id: string, patch: Partial<Vehicle>): Vehicle | undefined {
  const idx = memory.vehicles.findIndex((v) => v.id === id);
  const current = memory.vehicles[idx];
  if (!current) return undefined;
  const next = { ...current, ...patch, id };
  memory.vehicles[idx] = next;
  return clone(next);
}

export function deleteVehicle(id: string): boolean {
  const before = memory.vehicles.length;
  memory.vehicles = memory.vehicles.filter((v) => v.id !== id);
  return memory.vehicles.length < before;
}

export function createValuation(input: ValuationInput): Valuation {
  const estimate = estimateValuation(input);
  const row: Valuation = {
    id: randomUUID(),
    ...input,
    ...estimate,
    status: "new",
    createdAt: Date.now(),
  };
  memory.valuations.unshift(row);
  return clone(row);
}

export function listValuations(): Valuation[] {
  return clone(memory.valuations);
}

export function updateValuation(id: string, patch: Partial<Valuation>): Valuation | undefined {
  const idx = memory.valuations.findIndex((v) => v.id === id);
  const current = memory.valuations[idx];
  if (!current) return undefined;
  const next = { ...current, ...patch, id };
  memory.valuations[idx] = next;
  return clone(next);
}

export function createAppointment(
  input: Omit<Appointment, "id" | "createdAt" | "status"> & { status?: Appointment["status"] },
): Appointment {
  const row: Appointment = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "pending",
    createdAt: Date.now(),
  };
  memory.appointments.unshift(row);
  return clone(row);
}

export function listAppointments(): Appointment[] {
  return clone(memory.appointments);
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment | undefined {
  const idx = memory.appointments.findIndex((a) => a.id === id);
  const current = memory.appointments[idx];
  if (!current) return undefined;
  const next = { ...current, ...patch, id };
  memory.appointments[idx] = next;
  return clone(next);
}

export function createInquiry(input: Omit<Inquiry, "id" | "createdAt">): Inquiry {
  const row: Inquiry = { ...input, id: randomUUID(), createdAt: Date.now() };
  memory.inquiries.unshift(row);
  return clone(row);
}

export function listInquiries(): Inquiry[] {
  return clone(memory.inquiries);
}

export function createReservation(input: Omit<Reservation, "id" | "createdAt" | "status">): Reservation {
  const row: Reservation = {
    ...input,
    id: randomUUID(),
    status: "pending",
    createdAt: Date.now(),
  };
  memory.reservations.unshift(row);
  const vehicle = memory.vehicles.find((v) => v.id === input.vehicleId);
  if (vehicle && vehicle.status === "available") vehicle.status = "reserved";
  return clone(row);
}

export function listReservations(): Reservation[] {
  return clone(memory.reservations);
}

export function updateReservation(id: string, patch: Partial<Reservation>): Reservation | undefined {
  const idx = memory.reservations.findIndex((r) => r.id === id);
  const current = memory.reservations[idx];
  if (!current) return undefined;
  const next = { ...current, ...patch, id };
  memory.reservations[idx] = next;
  if (patch.status === "cancelled") {
    const vehicle = memory.vehicles.find((v) => v.id === next.vehicleId);
    if (vehicle && vehicle.status === "reserved") vehicle.status = "available";
  }
  if (patch.status === "completed") {
    const vehicle = memory.vehicles.find((v) => v.id === next.vehicleId);
    if (vehicle) vehicle.status = "sold";
  }
  return clone(next);
}

export function toggleFavorite(vehicleId: string, userId?: string): { saved: boolean } {
  const existing = memory.favorites.find((f) => f.vehicleId === vehicleId && f.userId === userId);
  if (existing) {
    memory.favorites = memory.favorites.filter((f) => f.id !== existing.id);
    return { saved: false };
  }
  memory.favorites.unshift({ id: randomUUID(), vehicleId, userId, createdAt: Date.now() });
  return { saved: true };
}

export function listFavorites(userId?: string): Vehicle[] {
  const ids = new Set(memory.favorites.filter((f) => f.userId === userId).map((f) => f.vehicleId));
  return clone(memory.vehicles.filter((v) => ids.has(v.id)));
}

export function marketplaceStats(): MarketplaceStats {
  const vehicles = memory.vehicles;
  return {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter((v) => v.status === "available").length,
    reservedVehicles: vehicles.filter((v) => v.status === "reserved").length,
    soldVehicles: vehicles.filter((v) => v.status === "sold").length,
    newValuations: memory.valuations.filter((v) => v.status === "new").length,
    pendingAppointments: memory.appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length,
    pendingReservations: memory.reservations.filter((r) => r.status === "pending" || r.status === "paid").length,
    inventoryValue: vehicles.filter((v) => v.status === "available" || v.status === "reserved").reduce((s, v) => s + v.price, 0),
  };
}

export function slugify(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nextVehicleId(): string {
  return `v-${randomUUID().slice(0, 8)}`;
}

export { STATUS_LABELS } from "@/lib/marketplace-labels";
