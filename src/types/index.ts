// ----------------------------------------------------------------------------
// Domain types shared between server, client and the realtime layer.
// ----------------------------------------------------------------------------

export type RoleId = "super_admin" | "admin" | "operator" | "viewer" | "user";

export type UserStatus = "active" | "disabled";

export type LocationSessionStatus = "active" | "ended";

export type SessionEndReason = "user" | "admin" | "timeout" | "account_deleted";

export type Permission =
  | "admin.access"
  | "stats.view"
  | "map.live_view"
  | "sessions.view"
  | "sessions.manage"
  | "users.view"
  | "users.create"
  | "users.manage"
  | "roles.assign"
  | "audit.view"
  | "risk.view"
  | "risk.manage"
  | "wallets.view"
  | "wallets.manage";

export type RiskEventSeverity = "info" | "warning" | "critical";

export type RiskEventStatus = "open" | "acknowledged" | "resolved";

export type WalletType = "main" | "trading" | "bonus" | "credit" | "crypto" | "multi_currency";

export type WalletStatus = "active" | "frozen" | "archived";

export type WalletTransferStatus = "posted" | "reversed";

export type WalletTransactionType =
  | "wallet.created"
  | "wallet.status_changed"
  | "transfer"
  | "transfer.reversal";

export type WalletTransactionDirection = "credit" | "debit" | "neutral";

// ----------------------------------------------------------------------------
// Database rows
// ----------------------------------------------------------------------------

export interface UserRow {
  id: string;
  email: string;
  email_verified: number;
  name: string;
  image: string | null;
  password_hash: string | null;
  role_id: RoleId;
  status: UserStatus;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
}

export interface DeviceSessionRow {
  id: string;
  user_id: string;
  user_agent: string;
  ip: string;
  device_name: string;
  created_at: number;
  last_seen_at: number;
  expires_at: number;
  revoked_at: number | null;
}

export interface LocationSessionRow {
  id: string;
  user_id: string;
  device_session_id: string | null;
  status: LocationSessionStatus;
  label: string;
  consent_granted_at: number;
  started_at: number;
  ended_at: number | null;
  end_reason: SessionEndReason | null;
  last_lat: number | null;
  last_lng: number | null;
  last_accuracy: number | null;
  last_update_at: number | null;
  last_address: string | null;
  points_count: number;
}

export interface LocationRow {
  id: number;
  session_id: string;
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recorded_at: number;
  created_at: number;
}

export interface AuditLogRow {
  id: number;
  actor_id: string | null;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string;
  ip: string;
  user_agent: string;
  metadata: string;
  created_at: number;
}

export interface RiskEventRow {
  id: number;
  source: string;
  event_type: string;
  severity: RiskEventSeverity;
  status: RiskEventStatus;
  risk_score: number;
  subject_type: string;
  subject_id: string;
  title: string;
  description: string;
  metadata: string;
  operator_note: string;
  acknowledged_by: string | null;
  acknowledged_at: number | null;
  resolved_by: string | null;
  resolved_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface WalletRow {
  id: string;
  user_id: string;
  wallet_type: WalletType;
  currency: string;
  status: WalletStatus;
  balance_minor: number;
  created_at: number;
  updated_at: number;
  user_email?: string;
  user_name?: string;
}

export interface WalletTransferRow {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount_minor: number;
  currency: string;
  status: WalletTransferStatus;
  memo: string;
  created_by: string | null;
  reversed_by: string | null;
  reversed_at: number | null;
  created_at: number;
}

export interface WalletTransactionRow {
  id: string;
  wallet_id: string;
  user_id: string;
  transfer_id: string | null;
  transaction_type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount_minor: number;
  currency: string;
  balance_after_minor: number;
  related_wallet_id: string | null;
  actor_id: string | null;
  memo: string;
  metadata: string;
  created_at: number;
}

// ----------------------------------------------------------------------------
// API DTOs
// ----------------------------------------------------------------------------

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: RoleId;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: number;
  lastLoginAt: number | null;
}

export interface DeviceSessionDTO {
  id: string;
  deviceName: string;
  userAgent: string;
  ip: string;
  createdAt: number;
  lastSeenAt: number;
  current: boolean;
}

export interface LocationSessionDTO {
  id: string;
  userId: string;
  status: LocationSessionStatus;
  label: string;
  consentGrantedAt: number;
  startedAt: number;
  endedAt: number | null;
  endReason: SessionEndReason | null;
  lastLat: number | null;
  lastLng: number | null;
  lastAccuracy: number | null;
  lastUpdateAt: number | null;
  lastAddress: string | null;
  pointsCount: number;
  // joined fields (admin views)
  userName?: string;
  userEmail?: string;
}

export interface LocationPointDTO {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recordedAt: number;
}

export interface AuditLogDTO {
  id: number;
  actorId: string | null;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  ip: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface AdminStatsDTO {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  sessionsToday: number;
  pointsToday: number;
  loginsToday: number;
  newUsersToday: number;
  realtimeConnections: number;
}

export interface AnalyticsBreakdownItem {
  label: string;
  count: number;
}

export interface GeoRegionItem extends AnalyticsBreakdownItem {
  lat: number;
  lng: number;
}

export interface AdminAnalyticsDTO {
  deviceBreakdown: AnalyticsBreakdownItem[];
  browserBreakdown: AnalyticsBreakdownItem[];
  geoRegions: GeoRegionItem[];
  avgSessionDurationMs: number;
  activeSessionCount: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type NotificationType =
  | "auth.login"
  | "auth.logout"
  | "location.session_started"
  | "location.session_stopped"
  | "consent.granted"
  | "consent.revoked"
  | "security.alert"
  | "device.revoked";

export interface NotificationDTO {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  readAt: number | null;
  createdAt: number;
}

export type SecuritySeverity = "info" | "warning" | "critical";

export interface SecurityEventDTO {
  id: number;
  eventType: string;
  severity: SecuritySeverity;
  actorId: string | null;
  actorEmail: string;
  ip: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface RiskEventDTO {
  id: number;
  source: string;
  eventType: string;
  severity: RiskEventSeverity;
  status: RiskEventStatus;
  riskScore: number;
  subjectType: string;
  subjectId: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  operatorNote: string;
  acknowledgedBy: string | null;
  acknowledgedAt: number | null;
  resolvedBy: string | null;
  resolvedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface WalletDTO {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  walletType: WalletType;
  currency: string;
  status: WalletStatus;
  balanceMinor: number;
  createdAt: number;
  updatedAt: number;
}

export interface WalletTransferDTO {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amountMinor: number;
  currency: string;
  status: WalletTransferStatus;
  memo: string;
  createdBy: string | null;
  reversedBy: string | null;
  reversedAt: number | null;
  createdAt: number;
}

export interface WalletTransactionDTO {
  id: string;
  walletId: string;
  userId: string;
  transferId: string | null;
  transactionType: WalletTransactionType;
  direction: WalletTransactionDirection;
  amountMinor: number;
  currency: string;
  balanceAfterMinor: number;
  relatedWalletId: string | null;
  actorId: string | null;
  memo: string;
  metadata: Record<string, unknown>;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Realtime protocol
// ----------------------------------------------------------------------------

/** Client -> server (publisher sockets only) */
export type RealtimeClientMessage = {
  t: "pos";
  lat: number;
  lng: number;
  acc: number;
  alt?: number | null;
  spd?: number | null;
  hdg?: number | null;
  ts: number;
};

/** Server -> client */
export type RealtimeServerEvent =
  | { t: "hello"; now: number; viewers: number }
  | {
      t: "pos";
      sid: string; // location session id
      uid: string;
      lat: number;
      lng: number;
      acc: number;
      spd?: number | null;
      hdg?: number | null;
      ts: number;
    }
  | { t: "session_started"; session: LocationSessionDTO }
  | { t: "session_ended"; sid: string; reason: SessionEndReason }
  | { t: "error"; code: string; message: string };

export interface RealtimeTicketPayload {
  sub: string; // user id
  role: RoleId;
  sid: string; // device session id
  scope: "publish" | "view";
  lsid?: string; // location session id (publish scope)
  name: string;
  exp: number; // unix ms
}
