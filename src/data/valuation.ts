import type { TransmissionType, Valuation } from "@/types/marketplace";

const BRAND_INDEX: Record<string, number> = {
  BMW: 1.35,
  "Mercedes-Benz": 1.4,
  Audi: 1.28,
  Volvo: 1.22,
  Toyota: 1.12,
  Honda: 1.08,
  Volkswagen: 1.05,
  Skoda: 0.98,
  Mazda: 1.02,
  Kia: 0.96,
  Hyundai: 0.95,
  Ford: 0.92,
  Seat: 0.9,
  Peugeot: 0.88,
  Nissan: 0.9,
  Citroen: 0.84,
  Opel: 0.82,
  Renault: 0.8,
  Fiat: 0.72,
  Dacia: 0.7,
};

export interface ValuationInput {
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
}

export function estimateValuation(input: ValuationInput): Pick<
  Valuation,
  "estimateMin" | "estimateMid" | "estimateMax" | "validUntil"
> {
  const age = Math.max(0, 2026 - input.year);
  let mid = 1_150_000 * (BRAND_INDEX[input.brand] ?? 0.85);
  mid *= Math.max(0.42, 1 - age * 0.075);
  mid *= Math.max(0.55, 1 - input.km / 280_000);
  if (input.transmission === "otomatik") mid *= 1.07;

  const cond = input.condition;
  if (cond.hasar === "agir") mid *= 0.62;
  else if (cond.hasar === "lokal") mid *= 0.9;
  if (cond.boya === "lokal") mid *= 0.94;
  if (cond.boya === "tam") mid *= 0.82;
  if (cond.tramer === "var") mid *= 0.88;
  if (cond.sigara === "evet") mid *= 0.97;
  if (cond.bakim === "yetkili") mid *= 1.04;

  mid = Math.round(mid / 1000) * 1000;
  const min = Math.round((mid * 0.93) / 1000) * 1000;
  const max = Math.round((mid * 1.06) / 1000) * 1000;
  return {
    estimateMin: min,
    estimateMid: mid,
    estimateMax: max,
    validUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
}

export const VALUATION_BRANDS = Object.keys(BRAND_INDEX).sort();

export const VALUATION_MODELS: Record<string, string[]> = {
  BMW: ["1 Serisi", "3 Serisi", "5 Serisi", "X1", "X3"],
  "Mercedes-Benz": ["A Serisi", "C Serisi", "E Serisi", "GLA", "GLC"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5"],
  Volvo: ["S60", "XC40", "XC60"],
  Toyota: ["Corolla", "C-HR", "RAV4", "Yaris"],
  Honda: ["Civic", "City", "CR-V"],
  Volkswagen: ["Golf", "Passat", "Tiguan", "Polo"],
  Skoda: ["Octavia", "Superb", "Karoq"],
  Mazda: ["3", "CX-5"],
  Kia: ["Sportage", "Ceed", "Cerato"],
  Hyundai: ["i20", "i30", "Tucson", "Bayon"],
  Ford: ["Focus", "Fiesta", "Puma", "Kuga"],
  Seat: ["Leon", "Ibiza", "Arona"],
  Peugeot: ["208", "308", "3008", "2008"],
  Nissan: ["Qashqai", "Juke", "Micra"],
  Citroen: ["C3", "C4", "C5 Aircross"],
  Opel: ["Corsa", "Astra", "Mokka"],
  Renault: ["Clio", "Megane", "Captur", "Kadjar"],
  Fiat: ["Egea", "500", "Tipo"],
  Dacia: ["Duster", "Sandero", "Jogger"],
};
