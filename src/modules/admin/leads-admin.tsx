"use client";

import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTRY } from "@/lib/money";
import type { Appointment, Reservation, Valuation } from "@/types/marketplace";

export function ValuationsAdmin() {
  const query = useQuery({
    queryKey: ["admin", "valuations"],
    queryFn: () => fetch("/api/valuations").then((r) => r.json() as Promise<Valuation[]>),
  });
  const client = useQueryClient();

  return (
    <AdminTable
      title="Değerlemeler"
      rows={query.data ?? []}
      columns={["Müşteri", "Araç", "Teklif", "Durum"]}
      render={(v) => (
        <TableRow key={v.id}>
          <TableCell>
            {v.name}
            <div className="text-xs text-muted-foreground">{v.phone}</div>
          </TableCell>
          <TableCell>
            {v.year} {v.brand} {v.model}
          </TableCell>
          <TableCell>{formatTRY(v.estimateMid)}</TableCell>
          <TableCell>
            <select
              defaultValue={v.status}
              className="h-8 rounded border px-2 text-xs"
              onChange={async (e) => {
                await fetch(`/api/admin/valuations/${v.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: e.target.value }),
                });
                void client.invalidateQueries({ queryKey: ["admin", "valuations"] });
              }}
            >
              {["new", "contacted", "appointment", "offered", "won", "lost"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </TableCell>
        </TableRow>
      )}
    />
  );
}

export function AppointmentsAdmin() {
  const query = useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: () => fetch("/api/appointments").then((r) => r.json() as Promise<Appointment[]>),
  });
  const client = useQueryClient();

  return (
    <AdminTable
      title="Randevular"
      rows={query.data ?? []}
      columns={["Müşteri", "Tür", "Tarih", "Durum"]}
      render={(a) => (
        <TableRow key={a.id}>
          <TableCell>
            {a.name}
            <div className="text-xs text-muted-foreground">{a.phone}</div>
          </TableCell>
          <TableCell>{a.kind}</TableCell>
          <TableCell>
            {a.date} {a.slot}
          </TableCell>
          <TableCell>
            <select
              defaultValue={a.status}
              className="h-8 rounded border px-2 text-xs"
              onChange={async (e) => {
                await fetch(`/api/admin/appointments/${a.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: e.target.value }),
                });
                void client.invalidateQueries({ queryKey: ["admin", "appointments"] });
              }}
            >
              {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </TableCell>
        </TableRow>
      )}
    />
  );
}

export function ReservationsAdmin() {
  const query = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () => fetch("/api/reservations").then((r) => r.json() as Promise<Reservation[]>),
  });
  const client = useQueryClient();

  return (
    <AdminTable
      title="Rezervasyonlar"
      rows={query.data ?? []}
      columns={["Müşteri", "Ön ödeme", "Durum"]}
      render={(r) => (
        <TableRow key={r.id}>
          <TableCell>
            {r.name}
            <div className="text-xs text-muted-foreground">{r.phone}</div>
          </TableCell>
          <TableCell>{formatTRY(r.deposit)}</TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await fetch(`/api/admin/reservations/${r.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "completed" }),
                  });
                  void client.invalidateQueries({ queryKey: ["admin", "reservations"] });
                }}
              >
                Teslim
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await fetch(`/api/admin/reservations/${r.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "cancelled" }),
                  });
                  void client.invalidateQueries({ queryKey: ["admin", "reservations"] });
                }}
              >
                İptal
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )}
    />
  );
}

function AdminTable<T>({
  title,
  rows,
  columns,
  render,
}: {
  title: string;
  rows: T[];
  columns: string[];
  render: (row: T) => ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground">
                  Kayıt yok
                </TableCell>
              </TableRow>
            ) : (
              rows.map(render)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
