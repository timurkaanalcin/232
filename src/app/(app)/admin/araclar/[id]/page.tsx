import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/modules/admin/vehicle-form";
import { getVehicleById } from "@/data/store";

export const metadata: Metadata = { title: "Araç düzenle" };

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) notFound();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">
        {vehicle.year} {vehicle.brand} {vehicle.model}
      </h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
