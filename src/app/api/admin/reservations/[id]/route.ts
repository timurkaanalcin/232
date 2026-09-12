import { NextResponse } from "next/server";
import { updateReservation } from "@/data/store";
import type { Reservation } from "@/types/marketplace";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = updateReservation(id, (await request.json()) as Partial<Reservation>);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}
