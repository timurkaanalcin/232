export type KycStatus = "none" | "draft" | "pending" | "approved" | "rejected";

export interface KycRecord {
  customerId: string;
  status: KycStatus;
  fullName: string;
  nationalId: string;
  birthDate: string;
  nationality: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  idFrontName: string;
  idBackName: string;
  selfieName: string;
  submittedAt?: string;
  reviewedAt?: string;
  note?: string;
  updatedAt: string;
}

const KEY = "ubs_kyc_v1";

function empty(customerId: string): KycRecord {
  return {
    customerId,
    status: "none",
    fullName: "",
    nationalId: "",
    birthDate: "",
    nationality: "TR",
    phone: "",
    address: "",
    city: "",
    country: "Türkiye",
    idFrontName: "",
    idBackName: "",
    selfieName: "",
    updatedAt: new Date().toISOString(),
  };
}

function loadAll(): Record<string, KycRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, KycRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, KycRecord>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getKyc(customerId: string): KycRecord {
  const all = loadAll();
  return all[customerId] ? { ...all[customerId] } : empty(customerId);
}

export function saveKyc(record: KycRecord): KycRecord {
  const next = { ...record, updatedAt: new Date().toISOString() };
  const all = loadAll();
  all[record.customerId] = next;
  saveAll(all);
  return next;
}

export function submitKyc(record: KycRecord): KycRecord {
  return saveKyc({
    ...record,
    status: "pending",
    submittedAt: new Date().toISOString(),
    note: "Belgeleriniz inceleniyor. Genellikle 1 iş günü içinde sonuçlanır.",
  });
}

export function kycLabel(status: KycStatus): string {
  switch (status) {
    case "approved":
      return "Doğrulandı";
    case "pending":
      return "İnceleniyor";
    case "rejected":
      return "Reddedildi";
    case "draft":
      return "Taslak";
    default:
      return "Başlanmadı";
  }
}
