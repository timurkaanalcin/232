import { useEffect, useState } from "react";
import { Bell, FileText, Fingerprint, ImagePlus, KeyRound, Moon, Sun, Trash2 } from "lucide-react";
import {
  addProfileDocument,
  getProfile,
  readFileAsDataUrl,
  saveProfilePhoto,
  type CustomerProfile,
} from "@/lib/profileOtp";
import { clearBiometricPref, enrollBiometric, getBiometricPref } from "@/lib/biometric";
import { pushNotification } from "@/lib/notifications";
import {
  generateTotpSecret,
  getTotpPref,
  saveTotpPref,
  totpOtpauthUrl,
  verifyTotp,
} from "@/lib/totp";
import { isPushEnabled, subscribePush } from "@/lib/push";
import { useTheme } from "@/lib/theme";
import { sendPasswordResetOtp } from "@/lib/emailService";
import { verifyEmailOtp } from "@/lib/profileOtp";
import { resetCustomerPin } from "@/lib/adminOps";
import { getReferral } from "@/lib/referral";

interface Props {
  customerId: string;
  email: string;
  name: string;
}

export default function ProfileExtras({ customerId, email, name }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<CustomerProfile>(() => getProfile(customerId));
  const [bioOn, setBioOn] = useState(() => !!getBiometricPref()?.enabled);
  const [totpOn, setTotpOn] = useState(() => !!getTotpPref(customerId)?.enabled);
  const [totpSecret, setTotpSecret] = useState(() => getTotpPref(customerId)?.secret || "");
  const [pushOn, setPushOn] = useState(() => isPushEnabled());
  const [msg, setMsg] = useState("");
  const [viewer, setViewer] = useState<{ name: string; dataUrl: string; mime: string } | null>(null);
  const [resetPin, setResetPin] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const referral = getReferral(customerId);

  useEffect(() => {
    setProfile(getProfile(customerId));
  }, [customerId]);

  const onPhoto = async (file?: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    saveProfilePhoto(customerId, dataUrl);
    setProfile(getProfile(customerId));
    setMsg("Profil fotoğrafı güncellendi.");
  };

  const onDoc = async (file?: File | null) => {
    if (!file) return;
    if (!/pdf|image\//i.test(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setMsg("PDF veya görsel yükleyin.");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    addProfileDocument(customerId, { name: file.name, mime: file.type || "application/pdf", dataUrl });
    setProfile(getProfile(customerId));
    setMsg("Belge eklendi.");
  };

  const toggleBio = async () => {
    if (bioOn) {
      clearBiometricPref();
      setBioOn(false);
      setMsg("Biyometrik giriş kapatıldı.");
      return;
    }
    const res = await enrollBiometric({ customerId, email, name });
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setBioOn(true);
    pushNotification({
      customerId,
      title: "Biyometrik giriş açık",
      body: "Face ID / Touch ID / Windows Hello ile giriş yapabilirsiniz.",
      kind: "security",
    });
    setMsg("Biyometrik giriş etkinleştirildi.");
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-2xl border border-black/8 bg-white p-4">
        <div className="flex items-center gap-3">
          <label className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full bg-black/5">
            {profile.photoDataUrl ? (
              <img src={profile.photoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-black/35">
                <ImagePlus className="h-5 w-5" />
              </span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold">Profil fotoğrafı</div>
            <div className="text-[11px] text-black/45">Dokunarak değiştir</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[14px] font-bold">Belgeler (PDF / görsel)</div>
          <label className="cursor-pointer rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white">
            Yükle
            <input
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => onDoc(e.target.files?.[0])}
            />
          </label>
        </div>
        <ul className="space-y-2">
          {profile.documents.length === 0 && (
            <li className="text-[12px] text-black/45">Henüz belge yok</li>
          )}
          {profile.documents.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setViewer({ name: d.name, dataUrl: d.dataUrl, mime: d.mime })}
                className="flex w-full items-center gap-2 rounded-xl border border-black/6 px-3 py-2 text-left text-[12px] hover:bg-black/[0.03]"
              >
                <FileText className="h-4 w-4 text-[#E60000]" />
                <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
                <span className="text-black/40">Görüntüle</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={toggleBio}
        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
          bioOn ? "border-emerald-200 bg-emerald-50" : "border-black/8 bg-white"
        }`}
      >
        <Fingerprint className={`h-5 w-5 ${bioOn ? "text-emerald-700" : "text-[#E60000]"}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold">Biyometrik giriş</div>
          <div className="text-[11px] text-black/50">
            {bioOn ? "Açık — Face ID / Touch ID" : "Kapalı — etkinleştirmek için dokunun"}
          </div>
        </div>
        {bioOn && (
          <Trash2
            className="h-4 w-4 text-black/35"
            onClick={(e) => {
              e.stopPropagation();
              clearBiometricPref();
              setBioOn(false);
            }}
          />
        )}
      </button>

      {msg && <p className="text-[12px] text-black/55">{msg}</p>}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white py-3 text-[12px] font-semibold"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === "light" ? "Koyu tema" : "Açık tema"}
        </button>
        <button
          type="button"
          onClick={async () => {
            const res = await subscribePush();
            setPushOn(res.ok);
            setMsg(res.ok ? "Push bildirimleri açıldı." : res.error || "Push açılamadı");
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white py-3 text-[12px] font-semibold"
        >
          <Bell className="h-4 w-4" />
          {pushOn ? "Push açık" : "Push aç"}
        </button>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-4">
        <div className="mb-2 text-[14px] font-bold">Authenticator 2FA</div>
        {!totpOn ? (
          <button
            type="button"
            className="w-full rounded-xl bg-black py-2.5 text-[13px] font-semibold text-white"
            onClick={async () => {
              const secret = generateTotpSecret();
              setTotpSecret(secret);
              const code = window.prompt(
                `Authenticator'a ekleyin.\nSecret: ${secret}\nDoğrulama kodunu girin:`
              );
              if (!code || !(await verifyTotp(secret, code))) {
                setMsg("2FA doğrulanamadı.");
                return;
              }
              saveTotpPref({ customerId, secret, enabled: true });
              setTotpOn(true);
              setMsg("2FA etkin.");
              pushNotification({
                customerId,
                title: "2FA açık",
                body: "Authenticator ile ek doğrulama aktif.",
                kind: "security",
              });
            }}
          >
            2FA etkinleştir
          </button>
        ) : (
          <div className="space-y-2 text-[12px]">
            <p className="text-emerald-700">2FA açık</p>
            <p className="break-all text-black/45">otpauth: {totpOtpauthUrl(totpSecret, email).slice(0, 48)}…</p>
            <button
              type="button"
              className="text-[#E60000] font-semibold"
              onClick={() => {
                saveTotpPref({ customerId, secret: totpSecret, enabled: false });
                setTotpOn(false);
                setMsg("2FA kapatıldı.");
              }}
            >
              Kapat
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-4">
        <div className="mb-2 flex items-center gap-2 text-[14px] font-bold">
          <KeyRound className="h-4 w-4 text-[#E60000]" />
          PIN sıfırla (e-posta OTP)
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-black/10 px-3 py-2 text-[12px] font-semibold"
            onClick={async () => {
              const { record, sent } = await sendPasswordResetOtp(email);
              setMsg(sent.ok ? "OTP gönderildi." : `OTP: ${record.code}`);
            }}
          >
            OTP gönder
          </button>
          <input
            value={resetOtp}
            onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="OTP"
            className="w-20 rounded-xl border border-black/10 px-2 py-2 text-[12px]"
          />
          <input
            value={resetPin}
            onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Yeni PIN"
            className="min-w-0 flex-1 rounded-xl border border-black/10 px-2 py-2 text-[12px]"
          />
        </div>
        <button
          type="button"
          className="mt-2 w-full rounded-xl bg-[#E60000] py-2.5 text-[13px] font-bold text-white"
          onClick={() => {
            const v = verifyEmailOtp(email, resetOtp);
            if (!v.ok) {
              setMsg(v.error);
              return;
            }
            const r = resetCustomerPin(customerId, resetPin);
            setMsg(r.ok ? "PIN güncellendi." : r.error);
            setResetOtp("");
            setResetPin("");
          }}
        >
          PIN’i güncelle
        </button>
      </div>

      {referral && (
        <div className="rounded-2xl border border-dashed border-[#E60000]/30 bg-[#E60000]/5 px-4 py-3 text-[13px]">
          <div className="font-bold">Davet kodunuz</div>
          <div className="mt-1 font-mono text-lg tracking-widest text-[#E60000]">{referral.code}</div>
          <div className="text-[11px] text-black/45">Kullanım: {referral.uses}</div>
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
              <span className="truncate text-[13px] font-bold">{viewer.name}</span>
              <button type="button" className="text-[12px] font-semibold text-[#E60000]" onClick={() => setViewer(null)}>
                Kapat
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-[#f4f4f6] p-2">
              {viewer.mime.includes("pdf") || viewer.dataUrl.startsWith("data:application/pdf") ? (
                <iframe title={viewer.name} src={viewer.dataUrl} className="h-[70dvh] w-full rounded-xl bg-white" />
              ) : (
                <img src={viewer.dataUrl} alt={viewer.name} className="mx-auto max-h-[70dvh] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
