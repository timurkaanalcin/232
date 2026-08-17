import { useState } from "react";
import { ArrowUpFromLine, Building2 } from "lucide-react";
import { createWithdraw, listFundOps } from "@/lib/funds";
import { issueEmailOtp, verifyEmailOtp, peekOtp } from "@/lib/profileOtp";

interface Props {
  customerId: string;
  email: string;
  balance: number;
  onBalanceChange?: (balance: number) => void;
}

export default function WithdrawPanel({ customerId, email, balance, onBalanceChange }: Props) {
  const [amount, setAmount] = useState("100");
  const [iban, setIban] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const history = listFundOps(customerId).filter((o) => o.type === "withdraw").slice(0, 5);

  const sendOtp = () => {
    issueEmailOtp(email, "withdraw");
    setOtpSent(true);
    setError("");
    const peek = peekOtp();
    if (peek && import.meta.env.DEV) {
      setOk(`OTP e-postaya gönderildi (demo: ${peek.code})`);
    } else {
      setOk("OTP e-postanıza gönderildi (SMS yerine e-posta).");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpSent) {
      setError("Önce e-posta OTP gönderin.");
      return;
    }
    const v = verifyEmailOtp(email, otp);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    const res = createWithdraw({
      customerId,
      amount: Number(amount),
      method: "bank",
      iban,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(`Çekim talebi alındı. Yeni bakiye $${res.balance.toFixed(2)}`);
    onBalanceChange?.(res.balance);
    setOtp("");
    setOtpSent(false);
  };

  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-black/8 bg-white p-4">
      <div className="flex items-center gap-2">
        <ArrowUpFromLine className="h-4 w-4 text-[#E60000]" />
        <h3 className="text-[15px] font-bold">Para çek</h3>
      </div>
      <p className="text-[12px] text-black/50">
        Kullanılabilir: ${balance.toFixed(2)} · Onay için e-posta OTP gerekir
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="number"
          min={20}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Tutar (USD)"
          className="w-full rounded-xl border border-black/12 px-3 py-2.5 text-[14px] outline-none focus:border-[#E60000]"
        />
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="IBAN"
            required
            className="w-full rounded-xl border border-black/12 py-2.5 pl-9 pr-3 text-[14px] outline-none focus:border-[#E60000]"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="E-posta OTP"
            inputMode="numeric"
            className="min-w-0 flex-1 rounded-xl border border-black/12 px-3 py-2.5 text-[14px] outline-none focus:border-[#E60000]"
          />
          <button
            type="button"
            onClick={sendOtp}
            className="shrink-0 rounded-xl border border-black/10 px-3 text-[12px] font-semibold"
          >
            OTP gönder
          </button>
        </div>
        {error && <p className="text-[12px] text-[#E60000]">{error}</p>}
        {ok && <p className="text-[12px] text-emerald-600">{ok}</p>}
        <button type="submit" className="w-full rounded-xl bg-black py-3 text-[13px] font-bold text-white">
          Çekim talebi oluştur
        </button>
      </form>

      {history.length > 0 && (
        <div className="border-t border-black/6 pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40">Son çekimler</div>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between text-[12px]">
                <span>
                  ${h.amount.toFixed(2)} · {h.status}
                </span>
                <span className="text-black/40">{new Date(h.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
