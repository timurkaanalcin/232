export type FuelType = "benzin" | "dizel" | "hibrit" | "elektrik" | "lpg";
export type TransmissionType = "otomatik" | "manuel";
export type BodyType = "sedan" | "hatchback" | "suv" | "crossover" | "station";
export type Drivetrain = "önden" | "arkadan" | "4x4";
export type VehicleStatus = "available" | "reserved" | "sold" | "draft";
export type LeadStatus = "new" | "contacted" | "appointment" | "offered" | "won" | "lost";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type ReservationStatus = "pending" | "paid" | "cancelled" | "completed";
export type InspectionStatus = "pass" | "attention" | "fail";

export interface VehicleImage {
  url: string;
  alt: string;
}

export interface InspectionItem {
  category: string;
  name: string;
  status: InspectionStatus;
  note?: string;
}

export interface InspectionReport {
  score: number;
  inspectedAt: number;
  technician: string;
  items: InspectionItem[];
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  trim: string;
  price: number;
  listPrice?: number;
  km: number;
  fuel: FuelType;
  transmission: TransmissionType;
  body: BodyType;
  color: string;
  doors: number;
  seats: number;
  engineCc: number;
  powerHp: number;
  drivetrain: Drivetrain;
  plateCity: string;
  city: string;
  centerId: string;
  status: VehicleStatus;
  featured: boolean;
  badge?: string;
  description: string;
  images: VehicleImage[];
  features: string[];
  inspection: InspectionReport;
  warrantyMonths: number;
  returnDays: number;
  videoUrl?: string;
  createdAt: number;
}

export interface VehicleFilters {
  q?: string;
  brand?: string;
  model?: string;
  city?: string;
  fuel?: FuelType;
  transmission?: TransmissionType;
  body?: BodyType;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  kmMax?: number;
  featured?: boolean;
  status?: VehicleStatus;
  sort?: "price_asc" | "price_desc" | "km_asc" | "year_desc" | "newest";
  page?: number;
  pageSize?: number;
}

export interface Center {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  services: string[];
}

export interface Valuation {
  id: string;
  year: number;
  brand: string;
  model: string;
  transmission: TransmissionType;
  km: number;
  plate?: string;
  city?: string;
  condition: Record<string, string>;
  name: string;
  email: string;
  phone: string;
  estimateMin: number;
  estimateMid: number;
  estimateMax: number;
  validUntil: number;
  status: LeadStatus;
  notes?: string;
  createdAt: number;
}

export interface Appointment {
  id: string;
  kind: "sell" | "buy" | "delivery";
  valuationId?: string;
  vehicleId?: string;
  centerId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  slot: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: number;
}

export interface Inquiry {
  id: string;
  vehicleId?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: number;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  deposit: number;
  status: ReservationStatus;
  createdAt: number;
}

export interface Favorite {
  id: string;
  vehicleId: string;
  userId?: string;
  createdAt: number;
}

export interface MarketplaceStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  soldVehicles: number;
  newValuations: number;
  pendingAppointments: number;
  pendingReservations: number;
  inventoryValue: number;
}
