const OTP_KEY = "ubs_email_otp_v1";
const PROFILE_KEY = "ubs_profiles_v1";

export type EmailOtpRecord = {
  email: string;
  code: string;
  expiresAt: number;
  purpose: "login" | "register" | "withdraw";
};

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function issueEmailOtp(email: string, purpose: EmailOtpRecord["purpose"] = "login"): EmailOtpRecord {
  const record: EmailOtpRecord = {
    email: email.trim().toLowerCase(),
    code: generateOtp(),
    expiresAt: Date.now() + 5 * 60 * 1000,
    purpose,
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  // Demo inbox mirror so OTP is visible without SMTP
  const inbox = JSON.parse(localStorage.getItem("ubs_mail_inbox_v1") || "[]") as {
    id: string;
    to: string;
    subject: string;
    body: string;
    at: string;
  }[];
  inbox.unshift({
    id: `mail_${Date.now()}`,
    to: record.email,
    subject: "UBS güvenlik kodu (OTP)",
    body: `Doğrulama kodunuz: ${record.code}\n\n5 dakika geçerlidir. Bu e-posta SMS yerine gönderilmiştir.`,
    at: new Date().toISOString(),
  });
  localStorage.setItem("ubs_mail_inbox_v1", JSON.stringify(inbox.slice(0, 20)));
  window.dispatchEvent(new CustomEvent("ubs-mail", { detail: record }));
  return record;
}

export function verifyEmailOtp(email: string, code: string): { ok: true } | { ok: false; error: string } {
  try {
    const raw = localStorage.getItem(OTP_KEY);
    if (!raw) return { ok: false, error: "No OTP requested." };
    const rec = JSON.parse(raw) as EmailOtpRecord;
    if (rec.email !== email.trim().toLowerCase()) return { ok: false, error: "OTP e-mail mismatch." };
    if (Date.now() > rec.expiresAt) return { ok: false, error: "OTP expired." };
    if (rec.code !== code.trim()) return { ok: false, error: "Invalid OTP code." };
    localStorage.removeItem(OTP_KEY);
    return { ok: true };
  } catch {
    return { ok: false, error: "OTP verification failed." };
  }
}

/** Dev/demo helper — last issued code for current email */
export function peekOtp(): EmailOtpRecord | null {
  try {
    const raw = localStorage.getItem(OTP_KEY);
    return raw ? (JSON.parse(raw) as EmailOtpRecord) : null;
  } catch {
    return null;
  }
}

export interface CustomerProfile {
  customerId: string;
  photoDataUrl?: string;
  documents: { id: string; name: string; mime: string; dataUrl: string; uploadedAt: string }[];
  updatedAt: string;
}

function loadProfiles(): Record<string, CustomerProfile> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CustomerProfile>) : {};
  } catch {
    return {};
  }
}

function saveProfiles(map: Record<string, CustomerProfile>) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(map));
}

export function getProfile(customerId: string): CustomerProfile {
  const all = loadProfiles();
  return (
    all[customerId] || {
      customerId,
      documents: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export function saveProfilePhoto(customerId: string, dataUrl: string) {
  const all = loadProfiles();
  const prev = getProfile(customerId);
  all[customerId] = { ...prev, photoDataUrl: dataUrl, updatedAt: new Date().toISOString() };
  saveProfiles(all);
}

export function addProfileDocument(customerId: string, file: { name: string; mime: string; dataUrl: string }) {
  const all = loadProfiles();
  const prev = getProfile(customerId);
  const doc = {
    id: `d_${Date.now()}`,
    name: file.name,
    mime: file.mime,
    dataUrl: file.dataUrl,
    uploadedAt: new Date().toISOString(),
  };
  all[customerId] = {
    ...prev,
    documents: [doc, ...prev.documents].slice(0, 12),
    updatedAt: new Date().toISOString(),
  };
  saveProfiles(all);
  return doc;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
