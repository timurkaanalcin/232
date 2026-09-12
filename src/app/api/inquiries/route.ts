import { NextResponse } from "next/server";
import { z } from "zod";
import { createInquiry, listInquiries } from "@/data/store";

const schema = z.object({
  vehicleId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  message: z.string().min(3),
});

export async function GET() {
  return NextResponse.json(listInquiries());
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(createInquiry(parsed.data), { status: 201 });
}
