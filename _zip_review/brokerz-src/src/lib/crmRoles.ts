import type { AdminRole, AdminUser, CrmLead, Department, Trader } from "./types";

export type CrmAction =
  | "dashboard"
  | "sales_crm"
  | "retention_crm"
  | "traders"
  | "trades"
  | "transactions"
  | "reports"
  | "balance"
  | "staff"
  | "settings"
  | "assign_leads"
  | "mark_ftd";

const ROLE_ACTIONS: Record<string, CrmAction[]> = {
  super_admin: [
    "dashboard",
    "sales_crm",
    "retention_crm",
    "traders",
    "trades",
    "transactions",
    "reports",
    "balance",
    "staff",
    "settings",
    "assign_leads",
    "mark_ftd",
  ],
  head_sales: [
    "dashboard",
    "sales_crm",
    "traders",
    "trades",
    "transactions",
    "reports",
    "balance",
    "staff",
    "assign_leads",
    "mark_ftd",
  ],
  head_retention: [
    "dashboard",
    "retention_crm",
    "traders",
    "trades",
    "transactions",
    "reports",
    "balance",
    "staff",
    "assign_leads",
  ],
  team_leader_sales: [
    "dashboard",
    "sales_crm",
    "traders",
    "trades",
    "transactions",
    "reports",
    "balance",
    "staff",
    "assign_leads",
    "mark_ftd",
  ],
  team_leader_retention: [
    "dashboard",
    "retention_crm",
    "traders",
    "trades",
    "transactions",
    "reports",
    "balance",
    "staff",
    "assign_leads",
  ],
  sales_agent: ["dashboard", "sales_crm", "traders", "trades", "transactions", "reports"],
  retention_agent: ["dashboard", "retention_crm", "traders", "trades", "transactions", "reports"],
};

export function normalizeRole(role: string): AdminRole {
  const known: AdminRole[] = [
    "super_admin",
    "head_sales",
    "head_retention",
    "team_leader_sales",
    "team_leader_retention",
    "sales_agent",
    "retention_agent",
  ];
  return (known.includes(role as AdminRole) ? role : "sales_agent") as AdminRole;
}

export function can(user: AdminUser | null | undefined, action: CrmAction): boolean {
  if (!user || !user.is_active) return false;
  const role = normalizeRole(String(user.role));
  return (ROLE_ACTIONS[role] ?? []).includes(action);
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    super_admin: "Super Admin",
    head_sales: "Head of Sales",
    head_retention: "Head of Retention",
    team_leader_sales: "Sales Team Leader",
    team_leader_retention: "Retention Team Leader",
    sales_agent: "Sales Agent",
    retention_agent: "Retention Agent",
  };
  return map[role] ?? role;
}

export function departmentOf(user: AdminUser): Department {
  if (user.department) return user.department;
  const role = normalizeRole(String(user.role));
  if (role === "super_admin") return "all";
  if (role.includes("retention")) return "retention";
  return "sales";
}

export function isSalesRole(user: AdminUser): boolean {
  const d = departmentOf(user);
  return d === "sales" || d === "all";
}

export function isRetentionRole(user: AdminUser): boolean {
  const d = departmentOf(user);
  return d === "retention" || d === "all";
}

/** Filter leads by the logged-in user's scope. */
export function filterLeads(leads: CrmLead[], user: AdminUser): CrmLead[] {
  const role = normalizeRole(String(user.role));
  if (role === "super_admin") return leads;
  if (role === "head_sales") return leads.filter((l) => l.department === "sales");
  if (role === "head_retention") return leads.filter((l) => l.department === "retention");
  if (role === "team_leader_sales" || role === "team_leader_retention") {
    return leads.filter((l) => l.team_id === user.team_id);
  }
  return leads.filter((l) => l.assigned_to === user.id);
}

/** Filter traders by the logged-in user's scope. */
export function filterTraders(traders: Trader[], user: AdminUser): Trader[] {
  const role = normalizeRole(String(user.role));
  if (role === "super_admin") return traders;
  if (role === "head_sales") return traders.filter((t) => t.department === "sales" || t.department === "all");
  if (role === "head_retention") return traders.filter((t) => t.department === "retention" || t.department === "all");
  if (role === "team_leader_sales" || role === "team_leader_retention") {
    return traders.filter((t) => t.team_id === user.team_id);
  }
  return traders.filter((t) => t.assigned_to === user.id);
}

export function filterByTraderIds<T extends { trader_id: string }>(
  rows: T[],
  allowedTraderIds: Set<string>,
  user: AdminUser,
): T[] {
  if (normalizeRole(String(user.role)) === "super_admin") return rows;
  return rows.filter((r) => allowedTraderIds.has(r.trader_id));
}

export function staffAssignableRoles(actor: AdminUser): AdminRole[] {
  const role = normalizeRole(String(actor.role));
  if (role === "super_admin") {
    return [
      "super_admin",
      "head_sales",
      "head_retention",
      "team_leader_sales",
      "team_leader_retention",
      "sales_agent",
      "retention_agent",
    ];
  }
  if (role === "head_sales") return ["team_leader_sales", "sales_agent"];
  if (role === "head_retention") return ["team_leader_retention", "retention_agent"];
  if (role === "team_leader_sales") return ["sales_agent"];
  if (role === "team_leader_retention") return ["retention_agent"];
  return [];
}

export function defaultDepartmentForRole(role: AdminRole): Department {
  if (role === "super_admin") return "all";
  if (role.includes("retention")) return "retention";
  return "sales";
}
