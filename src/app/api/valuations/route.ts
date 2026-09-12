import { NextResponse } from "next/server";
import { z } from "zod";
import { createValuation, listValuations } from "@/data/store";

const schema = z.object({
  year: z.number().int().min(2008).max(2026),
  brand: z.string().min(2),
  model: z.string().min(1),
  transmission: z.enum(["otomatik", "manuel"]),
  km: z.number().int().min(0).max(400000),
  plate: z.string().optional(),
  city: z.string().optional(),
  condition: z.record(z.string(), z.string()),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
});

export async function GET() {
  return NextResponse.json(listValuations());
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(createValuation(parsed.data), { status: 201 });
}
