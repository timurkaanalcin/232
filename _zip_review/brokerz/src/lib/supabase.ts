import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createLocalClient, type LocalClient } from "./localStore";

export type {
  Trader,
  Trade,
  Transaction,
  SiteSetting,
  AdminUser,
  Team,
  CrmLead,
  AdminRole,
  Department,
  LeadStatus,
} from "./types";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? "";
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? "";
const mode = (import.meta.env.VITE_DATA_MODE as string | undefined)?.trim().toLowerCase();

const hasSupabase =
  Boolean(url) &&
  Boolean(anonKey) &&
  !url.includes("your-project") &&
  anonKey !== "your_anon_key";

/** Use hosted Supabase only when explicitly requested and credentials are set. */
const useSupabase = mode === "supabase" && hasSupabase;

/** Default: local browser CRM — works without Bolt or any cloud backend. */
export const isLocalMode = !useSupabase;
export const dataBackend: "local" | "supabase" = useSupabase ? "supabase" : "local";

type AppDb = LocalClient | SupabaseClient;

function createDb(): AppDb {
  if (!useSupabase) {
    return createLocalClient();
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/** Drop-in data client: localStorage CRM by default, optional Supabase. */
export const supabase = createDb() as LocalClient;
