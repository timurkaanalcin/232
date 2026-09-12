import { NextResponse } from "next/server";
import { updateAppointment } from "@/data/store";
import type { Appointment } from "@/types/marketplace";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = updateAppointment(id, (await request.json()) as Partial<Appointment>);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}
