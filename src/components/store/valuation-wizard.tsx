"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VALUATION_BRANDS, VALUATION_MODELS } from "@/data/valuation";
import { formatTRY } from "@/lib/money";
import type { TransmissionType, Valuation } from "@/types/marketplace";

const YEARS = Array.from({ length: 16 }, (_, i) => 2026 - i);

type FormState = {
  year: number;
  brand: string;
  model: string;
  transmission: TransmissionType;
  km: number;
  plate: string;
  city: string;
  hasar: string;
  boya: string;
  tramer: string;
  sigara: string;
  bakim: string;
  name: string;
  email: string;
  phone: string;
};

const INITIAL: FormState = {
  year: 2021,
  brand: "Volkswagen",
  model: "Golf",
  transmission: "otomatik",
  km: 45000,
  plate: "",
  city: "İstanbul",
  hasar: "yok",
  boya: "orijinal",
  tramer: "yok",
  sigara: "hayir",
  bakim: "yetkili",
  name: "",
  email: "",
  phone: "",
};

export function ValuationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [result, setResult] = useState<Valuation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const models = VALUATION_MODELS[form.brand] ?? [];

  const steps = useMemo(
    () => [
      {
        title: "Yıl ve marka",
        body: (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Model yılı"
              value={String(form.year)}
              onChange={(v) => setForm((s) => ({ ...s, year: Number(v) }))}
              options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
            />
            <Select
              label="Marka"
              value={form.brand}
              onChange={(v) => setForm((s) => ({ ...s, brand: v, model: (VALUATION_MODELS[v] ?? [""])[0] ?? "" }))}
              options={VALUATION_BRANDS.map((b) => ({ value: b, label: b }))}
            />
            <Select
              label="Model"
              value={form.model}
              onChange={(v) => setForm((s) => ({ ...s, model: v }))}
              options={models.map((m) => ({ value: m, label: m }))}
            />
            <Select
              label="Vites"
              value={form.transmission}
              onChange={(v) => setForm((s) => ({ ...s, transmission: v as TransmissionType }))}
              options={[
                { value: "otomatik", label: "Otomatik" },
                { value: "manuel", label: "Manuel" },
              ]}
            />
          </div>
        ),
      },
      {
        title: "Kullanım",
        body: (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <Label>Kilometre</Label>
              <Input
                type="number"
                value={form.km}
                onChange={(e) => setForm((s) => ({ ...s, km: Number(e.target.value) }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <Label>Plaka (opsiyonel)</Label>
              <Input value={form.plate} onChange={(e) => setForm((s) => ({ ...s, plate: e.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <Label>Şehir</Label>
              <Input value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
            </label>
          </div>
        ),
      },
      {
        title: "Durum",
        body: (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Hasar"
              value={form.hasar}
              onChange={(v) => setForm((s) => ({ ...s, hasar: v }))}
              options={[
                { value: "yok", label: "Hasarsız" },
                { value: "lokal", label: "Lokal / hafif" },
                { value: "agir", label: "Ağır hasar" },
              ]}
            />
            <Select
              label="Boya"
              value={form.boya}
              onChange={(v) => setForm((s) => ({ ...s, boya: v }))}
              options={[
                { value: "orijinal", label: "Orijinal" },
                { value: "lokal", label: "Lokal boya" },
                { value: "tam", label: "Kapsamlı boya" },
              ]}
            />
            <Select
              label="Tramer"
              value={form.tramer}
              onChange={(v) => setForm((s) => ({ ...s, tramer: v }))}
              options={[
                { value: "yok", label: "Kayıt yok" },
                { value: "var", label: "Kayıt var" },
              ]}
            />
            <Select
              label="Bakım"
              value={form.bakim}
              onChange={(v) => setForm((s) => ({ ...s, bakim: v }))}
              options={[
                { value: "yetkili", label: "Yetkili servis" },
                { value: "ozel", label: "Özel servis" },
              ]}
            />
            <Select
              label="Sigara kullanımı"
              value={form.sigara}
              onChange={(v) => setForm((s) => ({ ...s, sigara: v }))}
              options={[
                { value: "hayir", label: "Hayır" },
                { value: "evet", label: "Evet" },
              ]}
            />
          </div>
        ),
      },
      {
        title: "İletişim",
        body: (
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <Label>Ad soyad</Label>
              <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </label>
            <label className="grid gap-1 text-sm">
              <Label>E-posta</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            </label>
            <label className="grid gap-1 text-sm">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required />
            </label>
          </div>
        ),
      },
    ],
    [form, models],
  );

  async function submit() {
    setError(null);
    const res = await fetch("/api/valuations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: form.year,
        brand: form.brand,
        model: form.model,
        transmission: form.transmission,
        km: form.km,
        plate: form.plate,
        city: form.city,
        condition: {
          hasar: form.hasar,
          boya: form.boya,
          tramer: form.tramer,
          sigara: form.sigara,
          bakim: form.bakim,
        },
        name: form.name,
        email: form.email,
        phone: form.phone,
      }),
    });
    if (!res.ok) {
      setError("Değerleme alınamadı. Bilgileri kontrol edin.");
      return;
    }
    setResult((await res.json()) as Valuation);
    setStep(steps.length);
  }

  if (result) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm text-amber-700">7 gün geçerli ön teklif</p>
        <h2 className="mt-2 text-2xl font-semibold">
          {form.year} {form.brand} {form.model}
        </h2>
        <p className="mt-6 text-4xl font-bold text-[#0B1F3A]">{formatTRY(result.estimateMid)}</p>
        <p className="mt-2 text-slate-600">
          Aralık: {formatTRY(result.estimateMin)} – {formatTRY(result.estimateMax)}
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Bu tutar beyanınıza göre hesaplandı. Kesin teklif, merkezde 30 dakikalık ekspertiz sonrası verilir.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="bg-amber-500 text-[#0B1F3A] hover:bg-amber-400" asChild>
            <Link href="/merkezler">Randevu için merkez seç</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/araclar">Stoka bak</Link>
          </Button>
        </div>
      </div>
    );
  }

  const current = steps[step];
  if (!current) return null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex gap-2">
        {steps.map((s, i) => (
          <div key={s.title} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-amber-500" : "bg-slate-200"}`} />
        ))}
      </div>
      <p className="text-sm text-slate-500">
        Adım {step + 1} / {steps.length}
      </p>
      <h2 className="text-2xl font-semibold">{current.title}</h2>
      <div className="mt-6">{current.body}</div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Geri
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} className="bg-[#0B1F3A] hover:bg-[#122a4d]">
            Devam
          </Button>
        ) : (
          <Button type="button" onClick={submit} className="bg-amber-500 text-[#0B1F3A] hover:bg-amber-400">
            Değerleme al
          </Button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-md border px-3">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
