import { AUDIT_ACTIONS } from "@/lib/constants";

type Tone = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

export const ACTION_LABELS: Record<string, { label: string; tone: Tone }> = {
  [AUDIT_ACTIONS.LOGIN]: { label: "Login", tone: "success" },
  [AUDIT_ACTIONS.LOGIN_FAILED]: { label: "Failed login", tone: "destructive" },
  [AUDIT_ACTIONS.LOGOUT]: { label: "Logout", tone: "secondary" },
  [AUDIT_ACTIONS.REGISTER]: { label: "Registered", tone: "default" },
  [AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED]: { label: "Reset requested", tone: "warning" },
  [AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED]: { label: "Reset completed", tone: "warning" },
  [AUDIT_ACTIONS.PASSWORD_CHANGED]: { label: "Password changed", tone: "warning" },
  [AUDIT_ACTIONS.PERMISSION_GRANTED]: { label: "Consent granted", tone: "success" },
  [AUDIT_ACTIONS.PERMISSION_REVOKED]: { label: "Consent revoked", tone: "secondary" },
  [AUDIT_ACTIONS.LOCATION_SESSION_STARTED]: { label: "Session started", tone: "default" },
  [AUDIT_ACTIONS.LOCATION_SESSION_STOPPED]: { label: "Session stopped", tone: "secondary" },
  [AUDIT_ACTIONS.ADMIN_VIEWED_SESSION]: { label: "Admin viewed session", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_STOPPED_SESSION]: { label: "Admin stopped session", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_USER_CREATED]: { label: "User created", tone: "default" },
  [AUDIT_ACTIONS.ADMIN_USER_UPDATED]: { label: "User updated", tone: "secondary" },
  [AUDIT_ACTIONS.ADMIN_ROLE_ASSIGNED]: { label: "Role assigned", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_CREATED]: { label: "Risk event created", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_ACKNOWLEDGED]: { label: "Risk acknowledged", tone: "warning" },
  [AUDIT_ACTIONS.ADMIN_RISK_EVENT_RESOLVED]: { label: "Risk resolved", tone: "success" },
  [AUDIT_ACTIONS.DEVICE_REVOKED]: { label: "Device revoked", tone: "secondary" },
  [AUDIT_ACTIONS.PROFILE_UPDATED]: { label: "Profile updated", tone: "secondary" },
  [AUDIT_ACTIONS.DATA_EXPORTED]: { label: "Data exported", tone: "default" },
  [AUDIT_ACTIONS.ACCOUNT_DELETED]: { label: "Account deleted", tone: "destructive" },
};

/** Audit actions considered security-relevant for the security feed. */
export const SECURITY_ACTIONS = new Set<string>([
  AUDIT_ACTIONS.LOGIN_FAILED,
  AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
  AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
  AUDIT_ACTIONS.PASSWORD_CHANGED,
  AUDIT_ACTIONS.DEVICE_REVOKED,
  AUDIT_ACTIONS.ADMIN_ROLE_ASSIGNED,
  AUDIT_ACTIONS.ACCOUNT_DELETED,
]);
