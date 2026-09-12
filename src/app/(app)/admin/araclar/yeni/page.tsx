import type { Metadata } from "next";
import { VehicleForm } from "@/modules/admin/vehicle-form";

export const metadata: Metadata = { title: "Yeni araç" };

export default function NewVehiclePage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Yeni araç</h1>
      <VehicleForm />
    </div>
  );
}
