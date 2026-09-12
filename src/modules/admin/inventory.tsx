"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/client-api";
import { formatKm, formatTRY } from "@/lib/money";
import { STATUS_LABELS } from "@/lib/marketplace-labels";
import type { Vehicle } from "@/types/marketplace";

export function InventoryAdmin() {
  const query = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => apiGet<{ items: Vehicle[]; total: number }>("/api/vehicles?pageSize=48"),
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Araç stoğu</h1>
          <p className="text-sm text-muted-foreground">{query.data?.total ?? 0} kayıt</p>
        </div>
        <Button asChild>
          <Link href="/admin/araclar/yeni">Yeni araç</Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Araç</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Şehir</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.items.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  {v.year} {v.brand} {v.model}
                  <div className="text-xs text-muted-foreground">{v.trim}</div>
                </TableCell>
                <TableCell>{formatTRY(v.price)}</TableCell>
                <TableCell>{formatKm(v.km)}</TableCell>
                <TableCell>{v.city}</TableCell>
                <TableCell>{STATUS_LABELS[v.status]}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/araclar/${v.id}`}>Düzenle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
