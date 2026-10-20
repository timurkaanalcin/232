import { useState } from "react";
import { ArrowDownToLine, Building2, CreditCard, Lock, X } from "lucide-react";
import { createDeposit } from "@/lib/funds";
import { getCustomerSession } from "@/lib/customerAuth";

interface Props {
  customerId: string;
  onBalanceChange?: (balance: number) => void;
}

const METHODS = [
  { id: "card", label: "Kart (Stripe/iyzico)", icon: CreditCard },
  { id: "bank", label: "Havale / EFT", icon: Building2 },
];

export default function DepositPanel({ customerId, onBalanceChange }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [paying, setPaying] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (method === "card") {
      if (card.number.replace(/\s/g, "").length < 12 || card.exp.length < 4 || card.cvc.length < 3) {
        setError("Kart bilgilerini kontrol edin.");
        return;
      }
      setPaying(true);
      await new Promise((r) => setTimeout(r, 900)); // simulated PSP
      setPaying(false);
    }

    const res = createDeposit({
      customerId,
      amount: Number(amount),
      method: method === "card" ? "card·stripe-sim" : "bank",
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(method === "card" ? `Kart ödemesi onaylandı · $${res.balance.toFixed(2)}` : `+$${res.balance.toFixed(2)}`);
    onBalanceChange?.(res.balance);
    const session = getCustomerSession();
    if (session) onBalanceChange?.(session.balance);
    setTimeout(() => setOpen(false), 900);
  };

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#ffb2c7]/15 bg-[#1a040a] px-2 py-2 sm:px-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#f83b00]">Para yatır</div>
          <div className="truncate text-[11px] text-[#ffb2c7]/60">Kart veya havale</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a] px-3 py-1.5 text-[12px] font-bold text-white"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Yatır
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-black shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Para yatır</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-black/55">Tutar (USD)</span>
                <input
                  type="number"
                  min={10}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-black/12 px-3 py-3 text-[15px] outline-none focus:border-[#E60000]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-[12px] font-semibold ${
                      method === m.id ? "border-[#E60000] bg-[#E60000]/8 text-[#E60000]" : "border-black/10"
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>

              {method === "card" && (
                <div className="space-y-2 rounded-xl border border-black/8 bg-[#fafafa] p-3">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-black/50">
                    <Lock className="h-3 w-3" /> Güvenli ödeme (simülasyon)
                  </div>
                  <input
                    placeholder="Kart üzerindeki isim"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-[13px]"
                  />
                  <input
                    placeholder="Kart numarası"
                    inputMode="numeric"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-[13px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="AA/YY"
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value })}
                      className="rounded-lg border border-black/10 px-3 py-2 text-[13px]"
                    />
                    <input
                      placeholder="CVC"
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                      className="rounded-lg border border-black/10 px-3 py-2 text-[13px]"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-[12px] text-[#E60000]">{error}</p>}
              {ok && <p className="text-[12px] text-emerald-600">{ok}</p>}
              <button
                type="submit"
                disabled={paying}
                className="w-full rounded-xl bg-[#E60000] py-3 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {paying ? "Ödeme işleniyor…" : "Onayla ve yatır"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
