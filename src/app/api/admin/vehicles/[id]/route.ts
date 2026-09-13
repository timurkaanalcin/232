import { NextResponse } from "next/server";
import { deleteVehicle, getVehicleById, updateVehicle } from "@/data/store";
import { requireAdminResponse } from "@/lib/require-admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminResponse();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const current = getVehicleById(id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const patch = { ...body } as Partial<typeof current>;
  if (typeof body.imageUrl === "string" && body.imageUrl) {
    patch.images = [{ url: body.imageUrl, alt: `${current.brand} ${current.model}` }, ...current.images.slice(1)];
  }
  const updated = updateVehicle(id, patch);
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ ok: deleteVehicle(id) });
}
