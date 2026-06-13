// ----------------------------------------------------------------------------
// Domain types shared between server, client and the realtime layer.
// ----------------------------------------------------------------------------

export type RoleId = "super_admin" | "shift" | "admin" | "operator" | "viewer" | "retention" | "sale" | "user";

export type UserStatus = "active" | "disabled";

export type CrmDepartment = "management" | "retention" | "sale" | "client";

export type CrmStatus =
  | "new"
  | "no_answer"
  | "call_back"
  | "not_interested"
  | "low_potential"
  | "potential"
  | "recovery"
  | "active"
  | "wrong_number"
  | "wrong_person"
  | "referral"
  | "test"
  | "renew"
  | "depositor"
  | "trash"
  | "never_answer";

export type RetentionStatus = CrmStatus;

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
  | "customers.manage"
  | "tickets.manage"
  | "documents.manage"
  | "reports.view"
  | "settings.manage"
  | "admin.panel"
  | "trading.access"
  | "trading.order";

export type TradeSide = "buy" | "sell";

export type TradeOrderType = "market" | "limit";

export type TradeOrderStatus = "filled" | "rejected";

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
  client_numeric_id: string;
  sale_status: CrmStatus;
  sale_status_scheduled_at: number | null;
  phone: string;
  address: string;
  date_of_birth: string;
  department: CrmDepartment;
  retention_status: RetentionStatus;
  retention_status_scheduled_at: number | null;
  ad_source: string;
  manager_id: string | null;
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

// ----------------------------------------------------------------------------
// API DTOs
// ----------------------------------------------------------------------------

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: RoleId;
  clientNumericId: string;
  saleStatus: CrmStatus;
  saleStatusScheduledAt: number | null;
  phone: string;
  address: string;
  dateOfBirth: string;
  department: CrmDepartment;
  retentionStatus: RetentionStatus;
  retentionStatusScheduledAt: number | null;
  adSource: string;
  managerId: string | null;
  managerName: string | null;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: number;
  lastLoginAt: number | null;
  tradingSummary: {
    orderCount: number;
    totalNotional: number;
    openPositions: number;
    lastTradeAt: number | null;
  };
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

export interface CrmOverviewDTO {
  totalClients: number;
  activeClients: number;
  newClientsToday: number;
  missingAdSource: number;
  tradingOrderCount: number;
  tradingVolume: number;
  tradingActiveClients: number;
  followUps: {
    overdue: number;
    today: number;
    upcoming: number;
  };
  saleStatusBreakdown: AnalyticsBreakdownItem[];
  retentionStatusBreakdown: AnalyticsBreakdownItem[];
  adSourceBreakdown: AnalyticsBreakdownItem[];
  teamRoleBreakdown: AnalyticsBreakdownItem[];
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

export interface TradingClientDTO {
  id: string;
  clientNumericId: string;
  name: string;
  email: string;
  phone: string;
  adSource: string;
  saleStatus: CrmStatus;
  retentionStatus: CrmStatus;
  managerName: string | null;
}

export interface TradingOrderDTO {
  id: string;
  clientId: string;
  clientName: string;
  clientNumericId: string;
  actorEmail: string;
  symbol: string;
  market: string;
  side: TradeSide;
  orderType: TradeOrderType;
  quantity: number;
  price: number;
  status: TradeOrderStatus;
  notional: number;
  pnl: number;
  createdAt: number;
}

export interface TradingPositionDTO {
  clientId: string;
  clientName: string;
  clientNumericId: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
}

export interface TradingSymbolDTO {
  symbol: string;
  name: string;
  market: string;
  price: number;
  change: number;
}

export interface TradingWorkspaceDTO {
  clients: TradingClientDTO[];
  symbols: TradingSymbolDTO[];
  orders: TradingOrderDTO[];
  positions: TradingPositionDTO[];
  summary: {
    equity: number;
    availableMargin: number;
    usedMargin: number;
    openPositions: number;
    dailyPnl: number;
  };
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
