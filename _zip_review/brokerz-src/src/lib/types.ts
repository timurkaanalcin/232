export type Department = "sales" | "retention" | "all";

export type AdminRole =
  | "super_admin"
  | "head_sales"
  | "head_retention"
  | "team_leader_sales"
  | "team_leader_retention"
  | "sales_agent"
  | "retention_agent";

export type LeadStatus =
  | "new"
  | "contacted"
  | "registered"
  | "ftd"
  | "retention"
  | "inactive";

export interface Trader {
  id: string;
  email: string;
  name: string;
  account_number: string;
  account_type: string;
  balance: number;
  equity: number;
  leverage: number;
  currency: string;
  is_active: boolean;
  is_demo: boolean;
  assigned_to: string | null;
  department: Department;
  lead_id: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  trader_id: string;
  symbol: string;
  type: string;
  volume: number;
  open_price: number;
  close_price: number | null;
  open_time: string;
  close_time: string | null;
  sl: number | null;
  tp: number | null;
  profit: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  trader_id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: AdminRole | string;
  department: Department;
  team_id: string | null;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  department: "sales" | "retention";
  leader_id: string | null;
  created_at: string;
}

export interface CrmLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  department: "sales" | "retention";
  assigned_to: string | null;
  team_id: string | null;
  trader_id: string | null;
  ftd_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type TableName =
  | "traders"
  | "trades"
  | "transactions"
  | "site_settings"
  | "admin_users"
  | "teams"
  | "crm_leads";

export type DbRow = Trader | Trade | Transaction | SiteSetting | AdminUser | Team | CrmLead;

export interface QueryError {
  message: string;
}

export interface QueryResult<T = DbRow> {
  data: T | T[] | null;
  error: QueryError | null;
}
