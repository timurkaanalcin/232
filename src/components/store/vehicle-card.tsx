import Link from "next/link";
import { FuelIcon, GaugeIcon, MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKm, formatTRY } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/marketplace";

const FUEL: Record<Vehicle["fuel"], string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  hibrit: "Hibrit",
  elektrik: "Elektrik",
  lpg: "LPG",
};

export function VehicleCard({ vehicle, className }: { vehicle: Vehicle; className?: string }) {
  const sold = vehicle.status === "sold";
  const reserved = vehicle.status === "reserved";

  return (
    <Link
      href={`/araclar/${vehicle.slug}`}
      className={cn(
        "group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vehicle.images[0]?.url}
          alt={vehicle.images[0]?.alt ?? vehicle.model}
          className={cn("size-full object-cover transition duration-500 group-hover:scale-105", sold && "opacity-60")}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {vehicle.badge ? <Badge className="bg-amber-500 text-[#0B1F3A]">{vehicle.badge}</Badge> : null}
          {sold ? <Badge variant="secondary">Satıldı</Badge> : null}
          {reserved ? <Badge variant="secondary">Rezerve</Badge> : null}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white">
          Ekspertiz {vehicle.inspection.score}
        </div>
      </div>
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {vehicle.year} · {vehicle.brand}
            </p>
            <h3 className="text-lg font-semibold leading-tight">
              {vehicle.model} {vehicle.trim}
            </h3>
          </div>
          <div className="text-right">
            {vehicle.listPrice && vehicle.listPrice > vehicle.price ? (
              <p className="text-xs text-slate-400 line-through">{formatTRY(vehicle.listPrice)}</p>
            ) : null}
            <p className="text-lg font-bold text-[#0B1F3A]">{formatTRY(vehicle.price)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <GaugeIcon className="size-3.5" />
            {formatKm(vehicle.km)}
          </span>
          <span className="inline-flex items-center gap-1">
            <FuelIcon className="size-3.5" />
            {FUEL[vehicle.fuel]} · {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-3.5" />
            {vehicle.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
