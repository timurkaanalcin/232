"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CENTERS } from "@/data/catalog";
import { formatTRY } from "@/lib/money";

export function ReserveForm({ vehicleId, price }: { vehicleId: string; price: number }) {
  const deposit = Math.min(25_000, Math.round(price * 0.02));
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        deposit,
      }),
    });
    setLoading(false);
    setStatus(res.ok ? "Rezervasyon alındı. Danışmanımız sizi arayacak." : "İşlem tamamlanamadı.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <p className="text-sm text-slate-600">
        {formatTRY(deposit)} ön ödeme ile 24 saat rezerve edin. Tutar satışa mahsup edilir.
      </p>
      <Field name="name" label="Ad soyad" required />
      <Field name="email" label="E-posta" type="email" required />
      <Field name="phone" label="Telefon" required />
      <Button type="submit" disabled={loading} className="bg-amber-500 text-[#0B1F3A] hover:bg-amber-400">
        {loading ? "Gönderiliyor…" : "Rezerve et"}
      </Button>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
    </form>
  );
}

export function InquiryForm({ vehicleId }: { vehicleId?: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });
    setStatus(res.ok ? "Mesajınız alındı." : "Gönderilemedi.");
    if (res.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="name" label="Ad soyad" required />
      <Field name="email" label="E-posta" type="email" required />
      <Field name="phone" label="Telefon" required />
      <label className="grid gap-1 text-sm">
        <Label>Mesaj</Label>
        <textarea name="message" required className="min-h-24 rounded-md border px-3 py-2 text-sm" />
      </label>
      <Button type="submit">Gönder</Button>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
    </form>
  );
}

export function AppointmentForm({ vehicleId, kind = "buy" }: { vehicleId?: string; kind?: "buy" | "sell" | "delivery" }) {
  const centers = CENTERS;
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        vehicleId,
        centerId: form.get("centerId"),
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        date: form.get("date"),
        slot: form.get("slot"),
        notes: form.get("notes"),
      }),
    });
    setStatus(res.ok ? "Randevu talebiniz alındı." : "Randevu oluşturulamadı.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        <Label>Merkez</Label>
        <select name="centerId" required className="h-9 rounded-md border px-3">
          {centers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <Field name="date" label="Tarih" type="date" required />
      <label className="grid gap-1 text-sm">
        <Label>Saat</Label>
        <select name="slot" className="h-9 rounded-md border px-3">
          {["10:00", "11:30", "13:00", "14:30", "16:00", "18:00"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <Field name="name" label="Ad soyad" required />
      <Field name="email" label="E-posta" type="email" required />
      <Field name="phone" label="Telefon" required />
      <Button type="submit">Randevu al</Button>
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <Label>{label}</Label>
      <Input name={name} type={type} required={required} />
    </label>
  );
}
