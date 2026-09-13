import type { VehicleStatus } from "@/types/marketplace";

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Satışta",
  reserved: "Rezerve",
  sold: "Satıldı",
  draft: "Taslak",
};
