import { NextResponse } from "next/server";
import { z } from "zod";
import { createReservation, getVehicleById, listReservations } from "@/data/store";

const schema = z.object({
  vehicleId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  deposit: z.number().positive(),
});

export async function GET() {
  return NextResponse.json(listReservations());
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const vehicle = getVehicleById(parsed.data.vehicleId);
  if (!vehicle || vehicle.status !== "available") {
    return NextResponse.json({ error: "vehicle_unavailable" }, { status: 409 });
  }
  return NextResponse.json(createReservation(parsed.data), { status: 201 });
}
