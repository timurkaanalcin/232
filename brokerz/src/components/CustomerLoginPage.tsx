import { useState } from "react";
import { ArrowLeft, ShieldCheck, Delete, Fingerprint } from "lucide-react";
import {
  loginCustomer,
  loginWithCustomerId,
  lookupCustomerEmail,
} from "@/lib/customerAuth";
import { getBiometricPref, verifyBiometric } from "@/lib/biometric";
import { verifyEmailOtp } from "@/lib/profileOtp";
import { isAccountFrozen, findCustomerByEmail } from "@/lib/adminOps";
import { getTotpPref, verifyTotp } from "@/lib/totp";
import { sendLoginOtp } from "@/lib/emailService";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useMessages } from "@/lib/i18n";

interface Props {
  onSuccess: () => void;
  onBack?: () => void;
  onGoRegister: () => void;
}

type Step = "email" | "otp" | "pin";

export default function CustomerLoginPage({ onSuccess, onBack, onGoRegister }: Props) {
  const m = useMessages();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const bio = getBiometricPref();

  const verifyPin = (fullPin: string) => {
    setLoading(true);
    setError("");
    window.setTimeout(() => {
      const result = loginCustomer(email, fullPin);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        setPin("");
        return;
      }
      onSuccess();
    }, 280);
  };

  const continueEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHint("");
    setLoading(true);
    window.setTimeout(() => {
      const result = lookupCustomerEmail(email);
      if (!result.ok) {
        setLoading(false);
        setError(result.error);
        return;
      }
      const cust = findCustomerByEmail(result.email);
      if (cust?.frozen || (cust && isAccountFrozen(cust.id))) {
        setLoading(false);
        setError("Hesabınız dondurulmuş. Destek ile iletişime geçin.");
        return;
      }
      setDisplayName(result.name);
      setEmail(result.email);
      sendLoginOtp(result.email, "login").then(({ record, sent }) => {
        setLoading(false);
        setOtp("");
        setStep("otp");
        setHint(
          sent.ok
            ? "OTP e-postanıza gönderildi."
            : `OTP hazır (mail API offline). Kod: ${record.code}`
        );
      });
    }, 250);
  };

  const continueOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = verifyEmailOtp(email, otp);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    const cust = findCustomerByEmail(email);
    const totp = cust ? getTotpPref(cust.id) : null;
    if (totp?.enabled) {
      const code = window.prompt("Authenticator 2FA kodu:");
      if (!code || !(await verifyTotp(totp.secret, code))) {
        setError("2FA kodu geçersiz.");
        return;
      }
    }
    setPin("");
    setStep("pin");
    setHint("");
  };

  const resendOtp = () => {
    sendLoginOtp(email, "login").then(({ record, sent }) => {
      setHint(sent.ok ? "Yeni OTP gönderildi." : `Yeni OTP: ${record.code}`);
      setOtp("");
    });
  };

  const pressDigit = (d: string) => {
    if (loading || pin.length >= 6) return;
    setError("");
    const next = pin + d;
    setPin(next);
    if (next.length === 6) verifyPin(next);
  };

  const backspace = () => {
    if (loading) return;
    setError("");
    setPin((p) => p.slice(0, -1));
  };

  const tryBiometric = async () => {
    setError("");
    setLoading(true);
    const verified = await verifyBiometric();
    if (!verified.ok) {
      setLoading(false);
      setError(verified.error);
      return;
    }
    const result = loginWithCustomerId(verified.customerId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
  };

  return (
    <div className="tw-scope ubs-auth flex min-h-screen flex-col bg-white text-black antialiased">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex h-14 max-w-[480px] items-center justify-between px-5">
          {step !== "email" ? (
            <button
              type="button"
              onClick={() => {
                if (step === "pin") {
                  setStep("otp");
                  setPin("");
                } else {
                  setStep("email");
                  setOtp("");
                }
                setError("");
              }}
              className="inline-flex items-center gap-1.5 bg-transparent text-[13px] text-black/55 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {m.auth.back}
            </button>
          ) : onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 bg-transparent text-[13px] text-black/55 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {m.auth.back}
            </button>
          ) : (
            <span />
          )}
          <img src="/ubs-logo.png" alt="UBS" className="h-8 w-auto object-contain" />
          <LanguageSwitcher tone="brand" compact />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 py-10">
        {step === "email" && (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#E60000] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                {m.auth.mobileLogin}
              </div>
              <h1 className="mt-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-tight text-black">
                {m.auth.enterEmail}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-black/50">
                E-posta OTP + 6 haneli PIN ile giriş
              </p>
            </div>

            {bio?.enabled && (
              <button
                type="button"
                disabled={loading}
                onClick={tryBiometric}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[#f7f7f8] py-3.5 text-[14px] font-semibold"
              >
                <Fingerprint className="h-5 w-5 text-[#E60000]" />
                Biyometrik giriş
              </button>
            )}

            <form onSubmit={continueEmail} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                  {m.auth.email}
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full border-b border-black/15 bg-transparent py-3 text-[15px] text-black outline-none placeholder:text-black/30 focus:border-[#E60000]"
                />
              </label>

              {error && <div className="py-2 text-[13px] text-[#E60000]">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center bg-[#E60000] py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#c40000] disabled:opacity-60"
              >
                {loading ? m.auth.wait : m.auth.continue}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-black/50">
              {m.auth.noAccount}{" "}
              <button type="button" onClick={onGoRegister} className="font-semibold text-[#E60000] hover:underline">
                {m.auth.register}
              </button>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#E60000] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                E-posta OTP
              </div>
              <h1 className="mt-4 font-serif text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight">
                Doğrulama kodu
              </h1>
              <p className="mt-2 text-[14px] text-black/50">
                {displayName} · {email}
              </p>
              {hint && <p className="mt-2 text-[12px] text-emerald-700">{hint}</p>}
            </div>
            <form onSubmit={continueOtp} className="space-y-4">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoFocus
                placeholder="6 haneli kod"
                className="w-full border-b border-black/15 bg-transparent py-3 text-center text-[22px] tracking-[0.4em] outline-none focus:border-[#E60000]"
              />
              {error && <div className="text-[13px] text-[#E60000]">{error}</div>}
              <button type="submit" className="w-full bg-[#E60000] py-3.5 text-[14px] font-semibold text-white">
                {m.auth.continue}
              </button>
              <button type="button" onClick={resendOtp} className="w-full text-[13px] font-semibold text-black/55">
                Kodu yeniden gönder
              </button>
            </form>
          </>
        )}

        {step === "pin" && (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#E60000] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                {m.auth.securityPin}
              </div>
              <h1 className="mt-4 font-serif text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight text-black">
                {m.auth.enterPin}
              </h1>
              <p className="mt-2 text-[14px] text-black/50">
                {displayName || "Customer"} · {email}
              </p>
            </div>

            <div className="mb-8 flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${i < pin.length ? "bg-[#E60000]" : "bg-black/15"}`}
                />
              ))}
            </div>

            {error && <div className="mb-4 text-center text-[13px] text-[#E60000]">{error}</div>}

            <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-3">
              {"123456789".split("").map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={loading}
                  onClick={() => pressDigit(d)}
                  className="flex h-14 items-center justify-center rounded-full text-[22px] font-semibold hover:bg-black/5"
                >
                  {d}
                </button>
              ))}
              <span />
              <button
                type="button"
                disabled={loading}
                onClick={() => pressDigit("0")}
                className="flex h-14 items-center justify-center rounded-full text-[22px] font-semibold hover:bg-black/5"
              >
                0
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={backspace}
                className="flex h-14 items-center justify-center rounded-full text-black/55 hover:bg-black/5"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
