import { NextResponse } from "next/server";
import { z } from "zod";
import { TRUST } from "@/lib/brand";
import { createVehicle, nextVehicleId, slugify } from "@/data/store";
import { requireAdminResponse } from "@/lib/require-admin";
import type { Vehicle } from "@/types/marketplace";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int(),
  trim: z.string().min(1),
  price: z.number().positive(),
  km: z.number().int().min(0),
  fuel: z.enum(["benzin", "dizel", "hibrit", "elektrik", "lpg"]),
  transmission: z.enum(["otomatik", "manuel"]),
  body: z.enum(["sedan", "hatchback", "suv", "crossover", "station"]),
  color: z.string().min(1),
  city: z.string().min(1),
  centerId: z.string().min(1),
  status: z.enum(["available", "reserved", "sold", "draft"]),
  featured: z.boolean(),
  description: z.string(),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const denied = await requireAdminResponse();
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const id = nextVehicleId();
  const vehicle: Vehicle = {
    id,
    slug: slugify(`${d.brand}-${d.model}-${d.year}-${id}`),
    brand: d.brand,
    model: d.model,
    year: d.year,
    trim: d.trim,
    price: d.price,
    km: d.km,
    fuel: d.fuel,
    transmission: d.transmission,
    body: d.body,
    color: d.color,
    doors: 5,
    seats: 5,
    engineCc: 1500,
    powerHp: 150,
    drivetrain: "önden",
    plateCity: d.city,
    city: d.city,
    centerId: d.centerId,
    status: d.status,
    featured: d.featured,
    description: d.description,
    images: d.imageUrl
      ? [{ url: d.imageUrl, alt: `${d.brand} ${d.model}` }]
      : [{ url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80", alt: "Araç" }],
    features: ["Apple CarPlay", "Geri görüş kamerası"],
    inspection: {
      score: 92,
      inspectedAt: Date.now(),
      technician: "Pista Operasyon",
      items: [{ category: "Belge", name: "İlk kayıt", status: "pass" }],
    },
    warrantyMonths: TRUST.warrantyMonths,
    returnDays: TRUST.returnDays,
    createdAt: Date.now(),
  };
  return NextResponse.json(createVehicle(vehicle), { status: 201 });
}
