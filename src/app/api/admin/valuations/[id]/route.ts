import { NextResponse } from "next/server";
import { updateValuation } from "@/data/store";
import type { Valuation } from "@/types/marketplace";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as Partial<Valuation>;
  const updated = updateValuation(id, body);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}
