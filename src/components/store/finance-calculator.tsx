"use client";

import { useMemo, useState } from "react";
import { formatTRY } from "@/lib/money";

export function FinanceCalculator({ price }: { price: number }) {
  const [down, setDown] = useState(Math.round(price * 0.3));
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(3.29);

  const monthly = useMemo(() => {
    const principal = Math.max(0, price - down);
    const r = rate / 100;
    if (r === 0) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }, [price, down, months, rate]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="font-semibold">Finansman hesapla</h3>
      <p className="mt-1 text-sm text-slate-600">Örnek aylık taksit — banka onayı ayrıca yapılır.</p>
      <div className="mt-4 grid gap-3 text-sm">
        <label className="grid gap-1">
          <span>Peşinat ({formatTRY(down)})</span>
          <input
            type="range"
            min={0}
            max={price}
            step={5000}
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
          />
        </label>
        <label className="grid gap-1">
          <span>Vade: {months} ay</span>
          <input type="range" min={12} max={48} step={6} value={months} onChange={(e) => setMonths(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span>Aylık faiz %{rate}</span>
          <input
            type="range"
            min={1.5}
            max={5}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#0B1F3A]">{formatTRY(Math.round(monthly))}</p>
      <p className="text-xs text-slate-500">/ ay · {months} taksit</p>
    </div>
  );
}
