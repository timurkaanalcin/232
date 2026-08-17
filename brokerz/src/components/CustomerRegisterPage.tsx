import { useState } from "react";
import { Mail, User, ArrowLeft, ShieldCheck, Delete } from "lucide-react";
import { registerCustomer } from "@/lib/customerAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useMessages } from "@/lib/i18n";
import { bumpReferralUse, findInviterByCode, makeReferralCode, saveReferral } from "@/lib/referral";

interface Props {
  onSuccess: () => void;
  onBack?: () => void;
  onGoLogin: () => void;
}

export default function CustomerRegisterPage({ onSuccess, onBack, onGoLogin }: Props) {
  const m = useMessages();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pinStep, setPinStep] = useState<"create" | "confirm">("create");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referral, setReferral] = useState("");
  const [phase, setPhase] = useState<"details" | "pin">("details");

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("E-mail is required.");
      return;
    }
    setPin("");
    setConfirm("");
    setPinStep("create");
    setPhase("pin");
  };

  const pressDigit = (d: string) => {
    if (loading) return;
    setError("");
    if (pinStep === "create") {
      if (pin.length >= 6) return;
      const next = pin + d;
      setPin(next);
      if (next.length === 6) {
        window.setTimeout(() => setPinStep("confirm"), 150);
      }
      return;
    }
    if (confirm.length >= 6) return;
    const next = confirm + d;
    setConfirm(next);
    if (next.length === 6) {
      setLoading(true);
      window.setTimeout(() => {
        const result = registerCustomer({
          email,
          password: pin,
          confirmPassword: next,
          name,
        });
        setLoading(false);
        if (!result.ok) {
          setError(result.error);
          setConfirm("");
          return;
        }
        const code = makeReferralCode(name || email);
        const inviter = referral.trim() ? findInviterByCode(referral.trim()) : null;
        saveReferral(result.session.id, code, inviter || undefined);
        if (inviter) bumpReferralUse(inviter);
        onSuccess();
      }, 280);
    }
  };

  const backspace = () => {
    if (loading) return;
    setError("");
    if (pinStep === "confirm") {
      if (confirm.length === 0) {
        setPinStep("create");
        setPin((p) => p.slice(0, -1));
        return;
      }
      setConfirm((p) => p.slice(0, -1));
      return;
    }
    setPin((p) => p.slice(0, -1));
  };

  const activePin = pinStep === "create" ? pin : confirm;

  return (
    <div className="tw-scope ubs-auth flex min-h-screen flex-col bg-white text-black antialiased">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex h-14 max-w-[480px] items-center justify-between px-5">
          {phase === "pin" ? (
            <button
              type="button"
              onClick={() => {
                setPhase("details");
                setPin("");
                setConfirm("");
                setPinStep("create");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 bg-transparent text-[13px] text-black/55 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Details
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
        {phase === "details" ? (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#E60000] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                {m.auth.register}
              </div>
              <h1 className="mt-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-tight text-black">
                {m.auth.createAccount}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-black/50">
                Next you will set a 6-digit mobile banking PIN.
              </p>
            </div>

            <form onSubmit={submitDetails} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                  Full name
                </span>
                <span className="relative flex items-center border-b border-black/15 focus-within:border-[#E60000]">
                  <User className="pointer-events-none absolute left-0 h-4 w-4 text-black/35" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-transparent py-3 pr-3 pl-8 text-[14px] text-black outline-none placeholder:text-black/30"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                  E-mail
                </span>
                <span className="relative flex items-center border-b border-black/15 focus-within:border-[#E60000]">
                  <Mail className="pointer-events-none absolute left-0 h-4 w-4 text-black/35" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-transparent py-3 pr-3 pl-8 text-[14px] text-black outline-none placeholder:text-black/30"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-black/45 uppercase">
                  Referral code (optional)
                </span>
                <input
                  type="text"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value.toUpperCase())}
                  placeholder="UBSXXXX"
                  className="w-full border-b border-black/15 bg-transparent py-3 text-[14px] outline-none focus:border-[#E60000]"
                />
              </label>

              {error && <div className="py-2.5 text-[13px] text-[#E60000]">{error}</div>}

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center bg-[#E60000] py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#c40000]"
              >
                Continue to PIN
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-black/50">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onGoLogin}
                className="font-semibold text-[#E60000] hover:underline"
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#E60000] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                Security PIN
              </div>
              <h1 className="mt-4 font-serif text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight text-black">
                {pinStep === "create" ? "Create your 6-digit PIN" : "Confirm your PIN"}
              </h1>
              <p className="mt-2 text-[14px] text-black/50">{email}</p>
            </div>

            <div className="mb-8 flex justify-center gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition ${
                    i < activePin.length
                      ? "border-[#E60000] bg-[#E60000]"
                      : "border-black/25 bg-transparent"
                  }`}
                />
              ))}
            </div>

            {error && <div className="mb-4 text-center text-[13px] text-[#E60000]">{error}</div>}
            {loading && <div className="mb-4 text-center text-[13px] text-black/40">Creating account…</div>}

            <div className="mx-auto grid w-full max-w-[280px] grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
                if (key === "") return <div key="empty" />;
                if (key === "del") {
                  return (
                    <button
                      key="del"
                      type="button"
                      onClick={backspace}
                      disabled={loading}
                      className="flex h-16 items-center justify-center rounded-full text-black/70 transition hover:bg-black/5 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pressDigit(key)}
                    disabled={loading}
                    className="flex h-16 items-center justify-center rounded-full text-[22px] font-semibold text-black transition hover:bg-black/5 active:bg-[#E60000]/10 disabled:opacity-50"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
