import { NextResponse } from "next/server";
import { z } from "zod";
import { createAppointment, listAppointments } from "@/data/store";

const schema = z.object({
  kind: z.enum(["sell", "buy", "delivery"]),
  valuationId: z.string().optional(),
  vehicleId: z.string().optional(),
  centerId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  date: z.string().min(4),
  slot: z.string().min(4),
  notes: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(listAppointments());
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(createAppointment(parsed.data), { status: 201 });
}
