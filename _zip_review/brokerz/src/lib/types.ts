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
  role: string;
  is_active: boolean;
  created_at: string;
}

export type TableName =
  | "traders"
  | "trades"
  | "transactions"
  | "site_settings"
  | "admin_users";

export type DbRow = Trader | Trade | Transaction | SiteSetting | AdminUser;

export interface QueryError {
  message: string;
}

export interface QueryResult<T = DbRow> {
  data: T | T[] | null;
  error: QueryError | null;
}
