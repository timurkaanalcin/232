import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileImage,
  IdCard,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getKyc,
  saveKyc,
  submitKyc,
  type KycRecord,
} from "@/lib/kyc";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useMessages } from "@/lib/i18n";

interface Props {
  customerId: string;
  customerName?: string;
  onBack?: () => void;
}

type Step = "hub" | "identity" | "address" | "documents" | "review";

export default function KycVerification({ customerId, customerName, onBack }: Props) {
  const m = useMessages();
  const STEPS = [
    { id: "identity" as const, title: m.kyc.identity, hint: m.kyc.identityHint },
    { id: "address" as const, title: m.kyc.address, hint: m.kyc.addressHint },
    { id: "documents" as const, title: m.kyc.documents, hint: m.kyc.documentsHint },
    { id: "review" as const, title: m.kyc.review, hint: m.kyc.reviewHint },
  ];
  const [record, setRecord] = useState<KycRecord>(() => {
    const existing = getKyc(customerId);
    if (!existing.fullName && customerName) {
      return { ...existing, fullName: customerName };
    }
    return existing;
  });
  const [step, setStep] = useState<Step>("hub");
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    if (record.status === "approved") return 100;
    if (record.status === "pending") return 90;
    let n = 0;
    if (record.fullName && record.nationalId.length >= 11 && record.birthDate) n += 25;
    if (record.phone && record.address && record.city) n += 25;
    if (record.idFrontName && record.idBackName && record.selfieName) n += 25;
    if (record.status === "draft") n += 10;
    return Math.min(n, 85);
  }, [record]);

  const statusLabel = m.kyc.labels[record.status] ?? m.kyc.labels.none;

  const patch = (partial: Partial<KycRecord>) => {
    setError("");
    const next = saveKyc({ ...record, ...partial, status: record.status === "none" ? "draft" : record.status });
    setRecord(next);
  };

  const filePick = (field: "idFrontName" | "idBackName" | "selfieName", file?: File | null) => {
    if (!file) return;
    patch({ [field]: file.name });
  };

  const goNext = () => {
    if (step === "identity") {
      if (!record.fullName.trim() || record.nationalId.replace(/\D/g, "").length !== 11 || !record.birthDate) {
        setError("Ad soyad, 11 haneli TCKN ve doğum tarihi zorunludur.");
        return;
      }
      setStep("address");
      return;
    }
    if (step === "address") {
      if (!record.phone.trim() || !record.address.trim() || !record.city.trim()) {
        setError("Telefon, adres ve şehir zorunludur.");
        return;
      }
      setStep("documents");
      return;
    }
    if (step === "documents") {
      if (!record.idFrontName || !record.idBackName || !record.selfieName) {
        setError("Kimlik ön/arka ve selfie yükleyin.");
        return;
      }
      setStep("review");
    }
  };

  const send = () => {
    const next = submitKyc(record);
    setRecord(next);
    setStep("hub");
  };

  const statusTone =
    record.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : record.status === "pending"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : record.status === "rejected"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-black/[0.04] text-black/70 border-black/10";

  if (step === "hub") {
    return (
      <div className="mx-auto flex min-h-full max-w-[480px] flex-col bg-[#f6f6f8] text-black">
        <header className="sticky top-0 z-10 border-b border-black/8 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            {onBack && (
              <button type="button" onClick={onBack} className="rounded-full p-2 hover:bg-black/5">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1">
              <div className="text-[15px] font-bold">{m.kyc.title}</div>
              <div className="text-[11px] text-black/50">{m.kyc.subtitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher tone="brand" compact />
              <ShieldCheck className="h-5 w-5 text-[#E60000]" />
            </div>
          </div>
        </header>

        <div className="space-y-4 p-4 pb-28">
          <div className={`rounded-2xl border px-4 py-3 ${statusTone}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold">
                {m.kyc.status}: {statusLabel}
              </span>
              <span className="text-[12px] font-medium tabular-nums">%{progress}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-[#E60000] transition-all" style={{ width: `${progress}%` }} />
            </div>
            {record.note && <p className="mt-2 text-[12px] opacity-80">{record.note}</p>}
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
            {STEPS.map((s, i) => {
              const done =
                (s.id === "identity" && record.nationalId.length === 11) ||
                (s.id === "address" && !!record.city) ||
                (s.id === "documents" && !!record.selfieName) ||
                (s.id === "review" && (record.status === "pending" || record.status === "approved"));
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={record.status === "pending" || record.status === "approved"}
                  onClick={() => setStep(s.id)}
                  className="flex w-full items-center gap-3 border-b border-black/6 px-4 py-3.5 text-left last:border-0 disabled:opacity-60"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold ${
                      done ? "bg-emerald-100 text-emerald-700" : "bg-[#E60000]/10 text-[#E60000]"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">{s.title}</div>
                    <div className="text-[11px] text-black/45">{s.hint}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-black/30" />
                </button>
              );
            })}
          </div>

          {record.status !== "pending" && record.status !== "approved" && (
            <button
              type="button"
              onClick={() => setStep("identity")}
              className="w-full rounded-2xl bg-[#E60000] py-3.5 text-[14px] font-bold text-white"
            >
              {m.kyc.start}
            </button>
          )}
        </div>
      </div>
    );
  }

  const title = STEPS.find((s) => s.id === step)?.title ?? "KYC";

  return (
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col bg-white text-black">
      <header className="sticky top-0 z-10 border-b border-black/8 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setStep("hub")} className="rounded-full p-2 hover:bg-black/5">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-[15px] font-bold">{title}</div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 pb-32">
        {step === "identity" && (
          <>
            <IconHint icon={<UserRound className="h-5 w-5" />} text="Kimlik kartınızdaki bilgilerle birebir girin." />
            <Field label={m.kyc.fullName} value={record.fullName} onChange={(v) => patch({ fullName: v })} />
            <Field
              label={m.kyc.nationalId}
              value={record.nationalId}
              inputMode="numeric"
              maxLength={11}
              onChange={(v) => patch({ nationalId: v.replace(/\D/g, "").slice(0, 11) })}
            />
            <Field
              label={m.kyc.birthDate}
              type="date"
              value={record.birthDate}
              onChange={(v) => patch({ birthDate: v })}
            />
            <Field label={m.kyc.nationality} value={record.nationality} onChange={(v) => patch({ nationality: v })} />
          </>
        )}

        {step === "address" && (
          <>
            <IconHint icon={<MapPin className="h-5 w-5" />} text="İletişim bilgileriniz hesap güvenliği için kullanılır." />
            <Field
              label={m.kyc.phone}
              value={record.phone}
              inputMode="tel"
              placeholder="+90 5xx xxx xx xx"
              onChange={(v) => patch({ phone: v })}
            />
            <Field label={m.kyc.addressField} value={record.address} onChange={(v) => patch({ address: v })} />
            <Field label={m.kyc.city} value={record.city} onChange={(v) => patch({ city: v })} />
            <Field label={m.kyc.country} value={record.country} onChange={(v) => patch({ country: v })} />
          </>
        )}

        {step === "documents" && (
          <>
            <IconHint
              icon={<IdCard className="h-5 w-5" />}
              text="Net, okunabilir fotoğraflar yükleyin. Gerçek bankada OCR + canlılık kontrolü yapılır."
            />
            <UploadRow
              label={m.kyc.idFront}
              fileName={record.idFrontName}
              icon={<FileImage className="h-4 w-4" />}
              pickLabel={m.kyc.pickFile}
              onFile={(f) => filePick("idFrontName", f)}
            />
            <UploadRow
              label={m.kyc.idBack}
              fileName={record.idBackName}
              icon={<FileImage className="h-4 w-4" />}
              pickLabel={m.kyc.pickFile}
              onFile={(f) => filePick("idBackName", f)}
            />
            <UploadRow
              label={m.kyc.selfie}
              fileName={record.selfieName}
              icon={<Camera className="h-4 w-4" />}
              pickLabel={m.kyc.pickFile}
              capture
              onFile={(f) => filePick("selfieName", f)}
            />
          </>
        )}

        {step === "review" && (
          <div className="space-y-3 rounded-2xl border border-black/8 bg-[#f6f6f8] p-4 text-[13px]">
            <Row k={m.kyc.fullName} v={record.fullName} />
            <Row k={m.kyc.nationalId} v={record.nationalId} />
            <Row k={m.kyc.birthDate} v={record.birthDate} />
            <Row k={m.kyc.phone} v={record.phone} />
            <Row k={m.kyc.addressField} v={`${record.address}, ${record.city}`} />
            <Row k={m.kyc.documents} v={`${record.idFrontName} · ${record.idBackName} · ${record.selfieName}`} />
            <p className="pt-2 text-[11px] leading-relaxed text-black/50">{m.kyc.consent}</p>
          </div>
        )}

        {error && <p className="text-[12px] font-medium text-[#E60000]">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/8 bg-white/95 px-4 py-3 backdrop-blur safe-bottom">
        <div className="mx-auto max-w-[480px]">
          {step === "review" ? (
            <button type="button" onClick={send} className="w-full rounded-2xl bg-[#E60000] py-3.5 text-[14px] font-bold text-white">
              {m.kyc.submit}
            </button>
          ) : (
            <button type="button" onClick={goNext} className="w-full rounded-2xl bg-[#E60000] py-3.5 text-[14px] font-bold text-white">
              {m.kyc.continue}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function IconHint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#E60000]/6 px-3 py-3 text-[12px] text-black/70">
      <div className="text-[#E60000]">{icon}</div>
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-black/55">{label}</span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-3 text-[15px] outline-none focus:border-[#E60000]"
      />
    </label>
  );
}

function UploadRow({
  label,
  fileName,
  icon,
  onFile,
  capture,
  pickLabel,
}: {
  label: string;
  fileName: string;
  icon: React.ReactNode;
  onFile: (f: File | null) => void;
  capture?: boolean;
  pickLabel: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E60000]/10 text-[#E60000]">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="truncate text-[11px] text-black/45">{fileName || pickLabel}</div>
      </div>
      <input
        type="file"
        accept="image/*"
        capture={capture ? "user" : undefined}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-black/6 pb-2 last:border-0">
      <span className="text-black/45">{k}</span>
      <span className="max-w-[60%] text-right font-medium">{v || "—"}</span>
    </div>
  );
}
