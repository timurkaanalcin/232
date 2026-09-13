import { AUDIT_ACTIONS } from "@/lib/constants";

type Tone = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

export const ACTION_LABELS: Record<string, { label: string; tone: Tone }> = {
  [AUDIT_ACTIONS.LOGIN]: { label: "Giriş", tone: "success" },
  [AUDIT_ACTIONS.LOGIN_FAILED]: { label: "Başarısız giriş", tone: "destructive" },
  [AUDIT_ACTIONS.LOGOUT]: { label: "Çıkış", tone: "secondary" },
  [AUDIT_ACTIONS.REGISTER]: { label: "Kayıt", tone: "default" },
  [AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED]: { label: "Sıfırlama istendi", tone: "warning" },
  [AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED]: { label: "Sıfırlama tamam", tone: "warning" },
  [AUDIT_ACTIONS.PASSWORD_CHANGED]: { label: "Şifre değişti", tone: "warning" },
  [AUDIT_ACTIONS.PERMISSION_GRANTED]: { label: "İzin verildi", tone: "success" },
  [AUDIT_ACTIONS.PERMISSION_REVOKED]: { label: "İzin iptal", tone: "secondary" },
  [AUDIT_ACTIONS.LOCATION_SESSION_STARTED]: { label: "Oturum başladı", tone: "default" },
  [AUDIT_ACTIONS.LOCATION_SESSION_STOPPED]: { label: "Oturum durdu", tone: "secondary" },
  [AUDIT_ACTIONS.ADMIN_VIEWED_SESSION]: { label: "Admin oturum gördü", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_STOPPED_SESSION]: { label: "Admin oturum durdurdu", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_USER_CREATED]: { label: "Kullanıcı oluşturuldu", tone: "default" },
  [AUDIT_ACTIONS.ADMIN_USER_UPDATED]: { label: "Kullanıcı güncellendi", tone: "secondary" },
  [AUDIT_ACTIONS.ADMIN_ROLE_ASSIGNED]: { label: "Rol atandı", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_CREATED]: { label: "Risk olayı", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_ACKNOWLEDGED]: { label: "Risk onaylandı", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_RESOLVED]: { label: "Risk çözüldü", tone: "success" },
  [AUDIT_ACTIONS.ADMIN_WALLET_CREATED]: { label: "Cüzdan oluşturuldu", tone: "default" },
  [AUDIT_ACTIONS.ADMIN_WALLET_STATUS_CHANGED]: { label: "Cüzdan durumu", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_WALLET_TRANSFER_CREATED]: { label: "Cüzdan transferi", tone: "default" },
  [AUDIT_ACTIONS.ADMIN_WALLET_TRANSFER_REVERSED]: { label: "Transfer geri alındı", tone: "destructive" },
  [AUDIT_ACTIONS.DEVICE_REVOKED]: { label: "Cihaz oturumu kapatıldı", tone: "secondary" },
  [AUDIT_ACTIONS.DEVICES_REVOKED_OTHERS]: { label: "Diğer cihazlar kapatıldı", tone: "secondary" },
  [AUDIT_ACTIONS.PROFILE_UPDATED]: { label: "Profil güncellendi", tone: "secondary" },
  [AUDIT_ACTIONS.DATA_EXPORTED]: { label: "Veri dışa aktarıldı", tone: "default" },
  [AUDIT_ACTIONS.ACCOUNT_DELETED]: { label: "Hesap silindi", tone: "destructive" },
  [AUDIT_ACTIONS.PREFS_UPDATED]: { label: "Gizlilik tercihleri", tone: "secondary" },
  [AUDIT_ACTIONS.LOCATION_HISTORY_DELETED]: { label: "Konum geçmişi silindi", tone: "destructive" },
};

/** Audit actions considered security-relevant for the security feed. */
export const SECURITY_ACTIONS = new Set<string>([
  AUDIT_ACTIONS.LOGIN_FAILED,
  AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
  AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
  AUDIT_ACTIONS.PASSWORD_CHANGED,
  AUDIT_ACTIONS.DEVICE_REVOKED,
  AUDIT_ACTIONS.DEVICES_REVOKED_OTHERS,
  AUDIT_ACTIONS.ADMIN_ROLE_ASSIGNED,
  AUDIT_ACTIONS.ACCOUNT_DELETED,
]);
