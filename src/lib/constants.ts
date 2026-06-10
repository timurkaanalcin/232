import type { Permission, RoleId } from "@/types";

export const APP_NAME = "LiveTrack";

export const ADMIN_ROLES: RoleId[] = ["super_admin", "admin", "operator", "viewer"];

export const ROLE_LABELS: Record<RoleId, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
  user: "User",
};

export const AUDIT_ACTIONS = {
  LOGIN: "auth.login",
  LOGIN_FAILED: "auth.login_failed",
  LOGOUT: "auth.logout",
  REGISTER: "auth.register",
  PASSWORD_RESET_REQUESTED: "auth.password_reset_requested",
  PASSWORD_RESET_COMPLETED: "auth.password_reset_completed",
  PASSWORD_CHANGED: "auth.password_changed",
  PERMISSION_GRANTED: "consent.permission_granted",
  PERMISSION_REVOKED: "consent.permission_revoked",
  LOCATION_SESSION_STARTED: "location.session_started",
  LOCATION_SESSION_STOPPED: "location.session_stopped",
  ADMIN_VIEWED_SESSION: "admin.viewed_user_session",
  ADMIN_STOPPED_SESSION: "admin.stopped_user_session",
  ADMIN_USER_CREATED: "admin.user_created",
  ADMIN_USER_UPDATED: "admin.user_updated",
  ADMIN_ROLE_ASSIGNED: "admin.role_assigned",
  DEVICE_REVOKED: "device.session_revoked",
  PROFILE_UPDATED: "profile.updated",
  DATA_EXPORTED: "privacy.data_exported",
  ACCOUNT_DELETED: "privacy.account_deleted",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const NOTIFICATION_TYPES = {
  LOGIN: "auth.login",
  LOGOUT: "auth.logout",
  SESSION_STARTED: "location.session_started",
  SESSION_STOPPED: "location.session_stopped",
  CONSENT_GRANTED: "consent.granted",
  CONSENT_REVOKED: "consent.revoked",
  SECURITY_ALERT: "security.alert",
  DEVICE_REVOKED: "device.revoked",
} as const;

export const SECURITY_EVENT_TYPES = {
  LOGIN_FAILED: "auth.login_failed",
  RATE_LIMITED: "rate_limit.exceeded",
  SESSION_EXPIRED: "session.expired",
  DEVICE_CHANGED: "device.changed",
  PASSWORD_CHANGED: "auth.password_changed",
  SUSPICIOUS_ACTIVITY: "security.suspicious",
} as const;

export const SECURITY = {
  PBKDF2_ITERATIONS: 100_000,
  SESSION_MAX_AGE_S: 30 * 24 * 60 * 60, // 30 days
  RESET_TOKEN_TTL_MS: 30 * 60 * 1000, // 30 minutes
  WS_TICKET_TTL_MS: 60 * 1000, // 60 seconds
  MIN_PASSWORD_LENGTH: 10,
} as const;

export const REALTIME = {
  /** Minimum interval between persisted location points (ms). */
  PERSIST_INTERVAL_MS: 3_000,
  /** Minimum interval between broadcast position events per session (ms). */
  BROADCAST_INTERVAL_MS: 1_000,
  /** Active sessions without updates for this long are auto-ended. */
  STALE_SESSION_TIMEOUT_MS: 5 * 60 * 1000,
  /** Stale-session sweep interval. */
  SWEEP_INTERVAL_MS: 60 * 1000,
  HUB_NAME: "hub:default",
} as const;

export const RATE_LIMITS = {
  LOGIN: { limit: 10, windowMs: 5 * 60 * 1000 },
  REGISTER: { limit: 5, windowMs: 60 * 60 * 1000 },
  PASSWORD_FORGOT: { limit: 5, windowMs: 15 * 60 * 1000 },
  PASSWORD_RESET: { limit: 10, windowMs: 15 * 60 * 1000 },
  LOCATION_UPDATE: { limit: 120, windowMs: 60 * 1000 },
  API_GENERAL: { limit: 300, windowMs: 60 * 1000 },
} as const;

/** Static fallback used when the permissions table cannot be reached. Mirrors database/seed.sql. */
export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  super_admin: [
    "admin.access",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "audit.view",
  ],
  admin: [
    "admin.access",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "audit.view",
  ],
  operator: ["admin.access", "stats.view", "map.live_view", "sessions.view", "sessions.manage"],
  viewer: ["admin.access", "stats.view", "map.live_view", "sessions.view"],
  user: [],
};
