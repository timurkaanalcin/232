import { NextResponse } from "next/server";
import { getVehicleBySlug } from "@/data/store";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(vehicle);
}
