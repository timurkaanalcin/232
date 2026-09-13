"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CarIcon, CalendarIcon, CircleDollarSignIcon, ClipboardListIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/client-api";
import { formatTRY } from "@/lib/money";
import type { MarketplaceStats } from "@/types/marketplace";

export function MarketplaceDashboard() {
  const query = useQuery({
    queryKey: ["admin", "marketplace"],
    queryFn: () => apiGet<MarketplaceStats>("/api/admin/marketplace"),
    refetchInterval: 10_000,
  });
  const s = query.data;

  const cards = [
    { title: "Satıştaki araç", value: s?.availableVehicles ?? "—", href: "/admin/araclar", icon: CarIcon },
    { title: "Yeni değerleme", value: s?.newValuations ?? "—", href: "/admin/degerlemeler", icon: ClipboardListIcon },
    { title: "Açık randevu", value: s?.pendingAppointments ?? "—", href: "/admin/randevular", icon: CalendarIcon },
    { title: "Stok değeri", value: s ? formatTRY(s.inventoryValue) : "—", href: "/admin/araclar", icon: CircleDollarSignIcon },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Pista operasyon</h1>
        <p className="text-sm text-muted-foreground">Stok, değerleme, randevu ve rezervasyon özeti</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{card.value}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
