"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CENTERS } from "@/data/catalog";
import type { Vehicle } from "@/types/marketplace";

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      brand: String(form.get("brand")),
      model: String(form.get("model")),
      year: Number(form.get("year")),
      trim: String(form.get("trim")),
      price: Number(form.get("price")),
      km: Number(form.get("km")),
      fuel: String(form.get("fuel")),
      transmission: String(form.get("transmission")),
      body: String(form.get("body")),
      color: String(form.get("color")),
      city: String(form.get("city")),
      centerId: String(form.get("centerId")),
      status: String(form.get("status")),
      featured: form.get("featured") === "on",
      description: String(form.get("description")),
      imageUrl: String(form.get("imageUrl")),
    };
    const url = vehicle ? `/api/admin/vehicles/${vehicle.id}` : "/api/admin/vehicles";
    const res = await fetch(url, {
      method: vehicle ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Kaydedilemedi");
      return;
    }
    router.push("/admin/araclar");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="brand" label="Marka" defaultValue={vehicle?.brand} required />
        <Field name="model" label="Model" defaultValue={vehicle?.model} required />
        <Field name="year" label="Yıl" type="number" defaultValue={vehicle?.year ?? 2022} required />
        <Field name="trim" label="Donanım" defaultValue={vehicle?.trim} required />
        <Field name="price" label="Fiyat" type="number" defaultValue={vehicle?.price} required />
        <Field name="km" label="Kilometre" type="number" defaultValue={vehicle?.km} required />
        <Field name="color" label="Renk" defaultValue={vehicle?.color ?? "Beyaz"} />
        <Field name="city" label="Şehir" defaultValue={vehicle?.city ?? "İstanbul"} />
        <label className="grid gap-1 text-sm">
          <Label>Yakıt</Label>
          <select name="fuel" defaultValue={vehicle?.fuel ?? "benzin"} className="h-9 rounded-md border px-3">
            <option value="benzin">Benzin</option>
            <option value="dizel">Dizel</option>
            <option value="hibrit">Hibrit</option>
            <option value="elektrik">Elektrik</option>
            <option value="lpg">LPG</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <Label>Vites</Label>
          <select name="transmission" defaultValue={vehicle?.transmission ?? "otomatik"} className="h-9 rounded-md border px-3">
            <option value="otomatik">Otomatik</option>
            <option value="manuel">Manuel</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <Label>Kasa</Label>
          <select name="body" defaultValue={vehicle?.body ?? "sedan"} className="h-9 rounded-md border px-3">
            <option value="sedan">Sedan</option>
            <option value="hatchback">Hatchback</option>
            <option value="suv">SUV</option>
            <option value="crossover">Crossover</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <Label>Merkez</Label>
          <select name="centerId" defaultValue={vehicle?.centerId ?? CENTERS[0]?.id} className="h-9 rounded-md border px-3">
            {CENTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <Label>Durum</Label>
          <select name="status" defaultValue={vehicle?.status ?? "available"} className="h-9 rounded-md border px-3">
            <option value="available">Satışta</option>
            <option value="reserved">Rezerve</option>
            <option value="sold">Satıldı</option>
            <option value="draft">Taslak</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={vehicle?.featured} />
          Öne çıkar
        </label>
      </div>
      <Field name="imageUrl" label="Kapak görseli URL" defaultValue={vehicle?.images[0]?.url} />
      <label className="grid gap-1 text-sm">
        <Label>Açıklama</Label>
        <textarea name="description" defaultValue={vehicle?.description} className="min-h-28 rounded-md border px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <Label>{label}</Label>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
    </label>
  );
}
