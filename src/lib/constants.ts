import type { CrmDepartment, CrmStatus, Permission, RetentionStatus, RoleId } from "@/types";

export const APP_NAME = "LiveTrack";

export const ROLE_IDS = ["super_admin", "shift", "admin", "operator", "viewer", "retention", "sale", "user"] as const;

export const ADMIN_ROLES: RoleId[] = ["super_admin", "shift", "admin", "operator", "viewer"];

export const ROLE_LABELS: Record<RoleId, string> = {
  super_admin: "Admin",
  shift: "Shift",
  admin: "Head",
  operator: "Retention Team Leader",
  viewer: "Sale Team Leader",
  retention: "Retention",
  sale: "Sale",
  user: "Client",
};

export const ROLE_RANK: Record<RoleId, number> = {
  super_admin: 100,
  shift: 90,
  admin: 80,
  operator: 60,
  viewer: 60,
  retention: 40,
  sale: 40,
  user: 0,
};

export const CRM_DEPARTMENT_LABELS: Record<CrmDepartment, string> = {
  management: "Yönetim",
  retention: "Retention",
  sale: "Sale",
  client: "Client",
};

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  new: "New",
  no_answer: "No Answer",
  call_back: "Call Back",
  not_interested: "Not Interested",
  low_potential: "Low Potential",
  potential: "Potential",
  recovery: "Recovery",
  active: "Active",
  wrong_number: "Wrong Number",
  wrong_person: "Wrong Person",
  referral: "Referral",
  test: "Test",
  renew: "Renew",
  depositor: "Depositor",
  trash: "Trash",
  never_answer: "Never Answer",
};

export const RETENTION_STATUS_LABELS: Record<RetentionStatus, string> = CRM_STATUS_LABELS;

export const SCHEDULE_REQUIRED_STATUSES: CrmStatus[] = ["call_back", "active"];

export function requiresStatusSchedule(status: CrmStatus): boolean {
  return SCHEDULE_REQUIRED_STATUSES.includes(status);
}

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
    "admin.panel",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "audit.view",
    "customers.manage",
    "tickets.manage",
    "documents.manage",
    "reports.view",
    "settings.manage",
  ],
  shift: [
    "admin.access",
    "admin.panel",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "audit.view",
    "customers.manage",
    "tickets.manage",
    "documents.manage",
    "reports.view",
  ],
  admin: [
    "admin.access",
    "admin.panel",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "audit.view",
    "customers.manage",
    "tickets.manage",
    "documents.manage",
    "reports.view",
  ],
  operator: [
    "admin.access",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "sessions.manage",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "customers.manage",
    "tickets.manage",
    "documents.manage",
    "reports.view",
  ],
  viewer: [
    "admin.access",
    "stats.view",
    "map.live_view",
    "sessions.view",
    "users.view",
    "users.create",
    "users.manage",
    "roles.assign",
    "customers.manage",
    "tickets.manage",
    "reports.view",
  ],
  retention: ["customers.manage", "tickets.manage", "documents.manage"],
  sale: ["customers.manage", "tickets.manage"],
  user: ["customers.manage"],
};

export function canAssignRole(actorRole: RoleId, targetRole: RoleId): boolean {
  if (actorRole === "super_admin") return true;
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

export function canManageRole(actorRole: RoleId, targetRole: RoleId): boolean {
  return canAssignRole(actorRole, targetRole);
}
