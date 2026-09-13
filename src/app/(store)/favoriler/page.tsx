"use client";

import { useEffect, useState } from "react";
import { VehicleCard } from "@/components/store/vehicle-card";
import { readFavorites } from "@/components/store/favorite-button";
import type { Vehicle } from "@/types/marketplace";

export default function FavoritesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const ids = readFavorites();
    if (ids.length === 0) return;
    void fetch("/api/vehicles?pageSize=48")
      .then((r) => r.json() as Promise<{ items: Vehicle[] }>)
      .then((data) => {
        setVehicles(data.items.filter((v) => ids.includes(v.id)));
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Favoriler</h1>
      {vehicles.length === 0 ? (
        <p className="mt-6 text-slate-600">Henüz favori araç yok. İlanlarda kalp ikonunu kullanın.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
