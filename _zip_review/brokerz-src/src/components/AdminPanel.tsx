import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Settings,
  Wallet,
  ArrowLeft,
  Search,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  AlertCircle,
  Save,
  LogOut,
  Lock,
  Mail,
  FileText,
  Download,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  HeartHandshake,
  UserCog,
} from "lucide-react";
import { supabase, dataBackend } from "@/lib/supabase";
import type {
  Trader,
  Trade,
  Transaction,
  SiteSetting,
  AdminUser,
  Team,
  CrmLead,
} from "@/lib/supabase";
import {
  can,
  filterByTraderIds,
  filterTraders,
  roleLabel,
} from "@/lib/crmRoles";
import CrmLeadsTab from "@/components/admin/CrmLeadsTab";
import StaffTab from "@/components/admin/StaffTab";
import CustomerOpsTab from "@/components/admin/CustomerOpsTab";
import { listPendingWithdrawals, listSupportTickets, listAllKyc } from "@/lib/adminOps";

interface Props {
  onBack: () => void;
}

type Tab =
  | "dashboard"
  | "sales"
  | "retention"
  | "traders"
  | "trades"
  | "transactions"
  | "settings"
  | "reports"
  | "staff"
  | "ops";

export default function AdminPanel({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [session, setSession] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [traders, setTraders] = useState<Trader[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [tRes, trRes, txRes, sRes, aRes, teamRes, leadRes] = await Promise.all([
      supabase.from("traders").select("*").order("created_at", { ascending: false }),
      supabase.from("trades").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").order("key", { ascending: true }),
      supabase.from("admin_users").select("*").order("created_at", { ascending: false }),
      supabase.from("teams").select("*").order("created_at", { ascending: false }),
      supabase.from("crm_leads").select("*").order("created_at", { ascending: false }),
    ]);
    if (tRes.data) setTraders(tRes.data as Trader[]);
    if (trRes.data) setTrades(trRes.data as Trade[]);
    if (txRes.data) setTransactions(txRes.data as Transaction[]);
    if (sRes.data) setSettings(sRes.data as SiteSetting[]);
    if (aRes.data) setStaff(aRes.data as AdminUser[]);
    if (teamRes.data) setTeams(teamRes.data as Team[]);
    if (leadRes.data) setLeads(leadRes.data as CrmLead[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const scopedTraders = useMemo(
    () => (session ? filterTraders(traders, session) : []),
    [traders, session],
  );
  const traderIds = useMemo(
    () => new Set(scopedTraders.map((t) => t.id)),
    [scopedTraders],
  );
  const scopedTrades = useMemo(
    () => (session ? filterByTraderIds(trades, traderIds, session) : []),
    [trades, traderIds, session],
  );
  const scopedTx = useMemo(
    () => (session ? filterByTraderIds(transactions, traderIds, session) : []),
    [transactions, traderIds, session],
  );

  const handleLogin = async () => {
    setLoginError("");
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .eq("password_hash", password)
      .eq("is_active", true)
      .maybeSingle();
    setLoading(false);
    if (error || !data) {
      setLoginError("Invalid email or password");
      return;
    }
    const admin = data as AdminUser;
    setSession(admin);
    setTab("dashboard");
  };

  if (!session) {
    return (
      <AdminLogin
        email={email}
        password={password}
        showPassword={showPassword}
        loginError={loginError}
        loading={loading}
        setEmail={setEmail}
        setPassword={setPassword}
        setShowPassword={setShowPassword}
        onLogin={handleLogin}
        onBack={onBack}
      />
    );
  }

  const goTab = (next: Tab) => {
    if (next === "sales" && !can(session, "sales_crm")) return;
    if (next === "retention" && !can(session, "retention_crm")) return;
    if (next === "settings" && !can(session, "settings")) return;
    if (next === "staff" && !can(session, "staff")) return;
    if (next === "traders" && !can(session, "traders")) return;
    if (next === "trades" && !can(session, "trades")) return;
    if (next === "transactions" && !can(session, "transactions")) return;
    if (next === "reports" && !can(session, "reports")) return;
    setTab(next);
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] text-white">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#0d1119]">
        <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
            <Lock className="h-4 w-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold">CRM Admin</div>
            <div className="text-[10px] text-white/40">
              {dataBackend === "local" ? "Local" : "Supabase"} · {roleLabel(String(session.role))}
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          <div className="space-y-1">
            {can(session, "dashboard") && (
              <NavBtn icon={LayoutDashboard} label="Dashboard" active={tab === "dashboard"} onClick={() => goTab("dashboard")} />
            )}
          </div>

          {(can(session, "sales_crm") || can(session, "retention_crm")) && (
            <div>
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">CRM</div>
              <div className="space-y-1">
                {can(session, "sales_crm") && (
                  <NavBtn
                    icon={Briefcase}
                    label="Sales"
                    active={tab === "sales"}
                    onClick={() => goTab("sales")}
                    badge={leads.filter((l) => l.department === "sales").length}
                  />
                )}
                {can(session, "retention_crm") && (
                  <NavBtn
                    icon={HeartHandshake}
                    label="Retention"
                    active={tab === "retention"}
                    onClick={() => goTab("retention")}
                    badge={leads.filter((l) => l.department === "retention").length}
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Trading</div>
            <div className="space-y-1">
              {can(session, "traders") && (
                <NavBtn icon={Users} label="Traders" active={tab === "traders"} onClick={() => goTab("traders")} badge={scopedTraders.length} />
              )}
              {can(session, "trades") && (
                <NavBtn
                  icon={TrendingUp}
                  label="Trades"
                  active={tab === "trades"}
                  onClick={() => goTab("trades")}
                  badge={scopedTrades.filter((t) => t.status === "open").length}
                />
              )}
              {can(session, "transactions") && (
                <NavBtn icon={Wallet} label="Transactions" active={tab === "transactions"} onClick={() => goTab("transactions")} badge={scopedTx.length} />
              )}
              <NavBtn
                icon={Lock}
                label="Customer Ops"
                active={tab === "ops"}
                onClick={() => goTab("ops")}
                badge={
                  listPendingWithdrawals().length +
                  listSupportTickets().filter((t) => t.status !== "closed").length +
                  listAllKyc().filter((k) => k.status === "pending").length
                }
              />
              {can(session, "reports") && (
                <NavBtn icon={FileText} label="Reports" active={tab === "reports"} onClick={() => goTab("reports")} />
              )}
            </div>
          </div>

          {(can(session, "staff") || can(session, "settings")) && (
            <div>
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">Management</div>
              <div className="space-y-1">
                {can(session, "staff") && (
                  <NavBtn icon={UserCog} label="Teams & Staff" active={tab === "staff"} onClick={() => goTab("staff")} badge={staff.length} />
                )}
                {can(session, "settings") && (
                  <NavBtn icon={Settings} label="Settings" active={tab === "settings"} onClick={() => goTab("settings")} />
                )}
              </div>
            </div>
          )}
        </nav>
        <div className="border-t border-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{session.name}</div>
              <div className="truncate text-[10px] text-white/40">{roleLabel(String(session.role))}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSession(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Site
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-yellow-400" />
          </div>
        )}
        {!loading && tab === "dashboard" && (
          <Dashboard traders={scopedTraders} trades={scopedTrades} transactions={scopedTx} leads={leads} user={session} />
        )}
        {!loading && tab === "sales" && can(session, "sales_crm") && (
          <CrmLeadsTab
            department="sales"
            leads={leads}
            staff={staff}
            teams={teams}
            traders={traders}
            user={session}
            onUpdate={loadData}
          />
        )}
        {!loading && tab === "retention" && can(session, "retention_crm") && (
          <CrmLeadsTab
            department="retention"
            leads={leads}
            staff={staff}
            teams={teams}
            traders={traders}
            user={session}
            onUpdate={loadData}
          />
        )}
        {!loading && tab === "traders" && (
          <TradersTab
            traders={scopedTraders}
            trades={scopedTrades}
            canBalance={can(session, "balance")}
            user={session}
            onUpdate={loadData}
          />
        )}
        {!loading && tab === "trades" && <TradesTab trades={scopedTrades} traders={scopedTraders} onUpdate={loadData} />}
        {!loading && tab === "transactions" && (
          <TransactionsTab
            transactions={scopedTx}
            traders={scopedTraders}
            canApprove={can(session, "balance")}
            onUpdate={loadData}
          />
        )}
        {!loading && tab === "ops" && <CustomerOpsTab />}
        {!loading && tab === "reports" && (
          <ReportsTab traders={scopedTraders} trades={scopedTrades} transactions={scopedTx} />
        )}
        {!loading && tab === "staff" && can(session, "staff") && (
          <StaffTab user={session} staff={staff} teams={teams} onUpdate={loadData} />
        )}
        {!loading && tab === "settings" && can(session, "settings") && (
          <SettingsTab settings={settings} onUpdate={loadData} />
        )}
      </main>
    </div>
  );
}

// === LOGIN ===
function AdminLogin({ email, password, showPassword, loginError, loading, setEmail, setPassword, setShowPassword, onLogin, onBack }: {
  email: string; password: string; showPassword: boolean; loginError: string; loading: boolean;
  setEmail: (v: string) => void; setPassword: (v: string) => void; setShowPassword: (v: boolean) => void;
  onLogin: () => void; onBack: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0e17] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div className="text-2xl font-bold">Admin Panel</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131622] p-8 shadow-2xl">
          <h1 className="mb-1 text-xl font-bold">Sign in to CRM</h1>
          <p className="mb-6 text-sm text-white/40">Manage traders, balances, and site settings</p>
          {loginError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />{loginError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/50"><Mail className="h-3.5 w-3.5" /> Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onLogin()} placeholder="admin@brokerz.com" className="w-full rounded-lg bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/50"><Lock className="h-3.5 w-3.5" /> Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onLogin()} placeholder="••••••••" className="w-full rounded-lg bg-black/30 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-yellow-400" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button onClick={onLogin} disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 text-sm font-semibold text-white shadow-lg shadow-yellow-900/20 transition hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
          <div className="mt-5 rounded-lg border border-white/5 bg-white/5 p-3 text-xs text-white/40">
            Staff CRM access — contact your Head or Super Admin for credentials.
          </div>
          <button onClick={onBack} className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-white/40 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </button>
        </div>
      </div>
    </div>
  );
}

// === NAV BUTTON ===
function NavBtn({ icon: Icon, label, active, onClick, badge }: { icon: React.ComponentType<{ className?: string }>; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-yellow-500/10 text-yellow-400" : "text-white/50 hover:bg-white/5 hover:text-white/70"}`}>
      <Icon className="h-4 w-4" /><span className="flex-1 text-left font-medium">{label}</span>
      {badge != null && badge > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/50"}`}>{badge}</span>}
    </button>
  );
}

// === DASHBOARD ===
function Dashboard({
  traders,
  trades,
  transactions,
  leads,
  user,
}: {
  traders: Trader[];
  trades: Trade[];
  transactions: Transaction[];
  leads: CrmLead[];
  user: AdminUser;
}) {
  const totalBalance = traders.reduce((s, t) => s + Number(t.balance), 0);
  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalProfit = closedTrades.reduce((s, t) => s + Number(t.profit), 0);
  const totalDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const activeTraders = traders.filter((t) => t.is_active).length;
  const newToday = traders.filter((t) => new Date(t.created_at).toDateString() === new Date().toDateString()).length;
  const winRate = closedTrades.length > 0 ? (closedTrades.filter((t) => Number(t.profit) > 0).length / closedTrades.length) * 100 : 0;
  const salesLeads = leads.filter((l) => l.department === "sales").length;
  const retClients = leads.filter((l) => l.department === "retention").length;

  const symbolVolumes: Record<string, number> = {};
  trades.forEach((t) => {
    symbolVolumes[t.symbol] = (symbolVolumes[t.symbol] ?? 0) + Number(t.volume);
  });
  const topSymbols = Object.entries(symbolVolumes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxVol = topSymbols.length > 0 ? topSymbols[0][1] : 1;

  const typeCounts: Record<string, number> = {};
  traders.forEach((t) => {
    typeCounts[t.account_type] = (typeCounts[t.account_type] ?? 0) + 1;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">
            Scoped overview · {roleLabel(String(user.role))} · {user.department}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          <span className="text-xs text-white/50">{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Traders in scope" value={traders.length.toString()} subtext={`${activeTraders} active, ${newToday} new today`} color="blue" trend={newToday > 0 ? "up" : "flat"} />
        <StatCard icon={DollarSign} label="Total Balance" value={`$${totalBalance.toFixed(2)}`} subtext="Across scoped traders" color="green" trend="up" />
        <StatCard icon={Activity} label="Open Positions" value={openTrades.length.toString()} subtext={`${closedTrades.length} closed total`} color="orange" trend={openTrades.length > 0 ? "up" : "flat"} />
        <StatCard icon={TrendingUp} label="Total P&L" value={`${totalProfit >= 0 ? "+" : ""}$${totalProfit.toFixed(2)}`} subtext={`Win rate: ${winRate.toFixed(1)}%`} color={totalProfit >= 0 ? "green" : "red"} trend={totalProfit >= 0 ? "up" : "down"} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Sales leads" value={String(salesLeads)} subtext="CRM sales department" color="orange" />
        <StatCard icon={HeartHandshake} label="Retention" value={String(retClients)} subtext="CRM retention clients" color="blue" />
        <StatCard icon={Wallet} label="Deposits" value={`$${totalDeposits.toFixed(0)}`} subtext="Completed in scope" color="green" />
        <StatCard icon={Wallet} label="Withdrawals" value={`$${totalWithdrawals.toFixed(0)}`} subtext="Completed in scope" color="red" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#131622] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Top symbols by volume</h3>
          <div className="space-y-3">
            {topSymbols.length === 0 && <div className="text-sm text-white/30">No trades yet</div>}
            {topSymbols.map(([sym, vol]) => (
              <div key={sym}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-mono text-white/70">{sym}</span>
                  <span className="text-white/40">{vol.toFixed(2)} lots</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${(vol / maxVol) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#131622] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Account type mix</h3>
          <div className="space-y-3">
            {Object.keys(typeCounts).length === 0 && <div className="text-sm text-white/30">No traders</div>}
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-sm uppercase text-white/60">{type}</span>
                <span className="font-mono font-semibold text-yellow-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// === TRADERS TAB ===
function TradersTab({
  traders,
  trades,
  canBalance,
  user,
  onUpdate,
}: {
  traders: Trader[];
  trades: Trade[];
  canBalance: boolean;
  user: AdminUser;
  onUpdate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Trader | null>(null);
  const [adjusting, setAdjusting] = useState<Trader | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = traders.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()) || t.account_number.includes(search);
    const matchesType = filterType === "all" || t.account_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Traders</h1>
          <p className="mt-1 text-sm text-white/40">
            {traders.length} in scope · {traders.filter((t) => t.is_active).length} active · {roleLabel(String(user.role))}
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300">
          <Plus className="h-4 w-4" /> Add Trader
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 max-w-md">
          <Search className="h-4 w-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or account number..." className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/30" />
          {["all", "classic", "raw", "tvraw"].map((f) => (
            <button key={f} onClick={() => setFilterType(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filterType === f ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
              {f === "tvraw" ? "TV RAW" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131622]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
              <th className="px-4 py-3 text-left font-medium">Trader</th>
              <th className="px-4 py-3 text-left font-medium">Account #</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Balance</th>
              <th className="px-4 py-3 text-right font-medium">Leverage</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Open</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const openCount = trades.filter((tr) => tr.trader_id === t.id && tr.status === "open").length;
              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
                        {(t.name || t.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{t.name || "Unnamed"}</div>
                        <div className="text-xs text-white/40">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{t.account_number}</td>
                  <td className="px-4 py-3"><span className="rounded bg-white/5 px-2 py-0.5 text-xs uppercase text-white/60">{t.account_type}</span></td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">${Number(t.balance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-white/70">1:{t.leverage}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.is_active ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {t.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white/70">{openCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {canBalance && (
                        <button onClick={() => setAdjusting(t)} title="Adjust balance" className="flex h-7 w-7 items-center justify-center rounded bg-green-500/10 text-green-400 transition hover:bg-green-500/20"><DollarSign className="h-3.5 w-3.5" /></button>
                      )}
                      <button onClick={() => setEditing(t)} title="Edit" className="flex h-7 w-7 items-center justify-center rounded bg-blue-500/10 text-blue-400 transition hover:bg-blue-500/20"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={async () => { await supabase.from("traders").update({ is_active: !t.is_active }).eq("id", t.id); onUpdate(); }} title={t.is_active ? "Disable" : "Enable"} className={`flex h-7 w-7 items-center justify-center rounded transition ${t.is_active ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"}`}>{t.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}</button>
                      <button onClick={async () => { if (confirm(`Delete trader ${t.name || t.email}? This cannot be undone.`)) { await supabase.from("traders").delete().eq("id", t.id); onUpdate(); } }} title="Delete" className="flex h-7 w-7 items-center justify-center rounded bg-red-500/10 text-red-400 transition hover:bg-red-500/20"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-sm text-white/30">No traders found</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <EditTraderModal trader={editing} onClose={() => setEditing(null)} onUpdate={onUpdate} />}
      {adjusting && <AdjustBalanceModal trader={adjusting} onClose={() => setAdjusting(null)} onUpdate={onUpdate} />}
      {showNew && <NewTraderModal onClose={() => setShowNew(false)} onUpdate={onUpdate} />}
    </div>
  );
}

// === TRADES TAB ===
function TradesTab({ trades, traders, onUpdate }: { trades: Trade[]; traders: Trader[]; onUpdate: () => void }) {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [search, setSearch] = useState("");
  const filtered = trades.filter((t) => (filter === "all" || t.status === filter) && (t.symbol.toLowerCase().includes(search.toLowerCase()) || search === ""));
  const traderName = (id: string) => traders.find((t) => t.id === id)?.name ?? "Unknown";

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Trades</h1>
          <p className="mt-1 text-sm text-white/40">{trades.length} total · {trades.filter((t) => t.status === "open").length} open · {trades.filter((t) => t.status === "closed").length} closed</p>
        </div>
        <div className="flex gap-1.5">
          {(["all", "open", "closed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 max-w-md">
        <Search className="h-4 w-4 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by symbol..." className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131622]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
              <th className="px-4 py-3 text-left font-medium">Trader</th>
              <th className="px-4 py-3 text-left font-medium">Symbol</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Volume</th>
              <th className="px-4 py-3 text-right font-medium">Open Price</th>
              <th className="px-4 py-3 text-right font-medium">Close Price</th>
              <th className="px-4 py-3 text-right font-medium">Profit</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{traderName(t.trader_id)}</td>
                <td className="px-4 py-3 font-mono text-white/80">{t.symbol}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${t.type === "buy" ? "text-green-400" : "text-red-400"}`}>{t.type.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-right font-mono text-white/70">{Number(t.volume).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-white/70">{Number(t.open_price).toFixed(5)}</td>
                <td className="px-4 py-3 text-right font-mono text-white/70">{t.close_price ? Number(t.close_price).toFixed(5) : "—"}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${Number(t.profit) >= 0 ? "text-green-400" : "text-red-400"}`}>{Number(t.profit) >= 0 ? "+" : ""}${Number(t.profit).toFixed(2)}</td>
                <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.status === "open" ? "bg-blue-500/10 text-blue-400" : t.status === "closed" ? "bg-white/10 text-white/50" : "bg-yellow-500/10 text-yellow-400"}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-center">
                  {t.status === "open" && <button onClick={async () => { await supabase.from("trades").update({ status: "closed", close_time: new Date().toISOString(), close_price: t.open_price, profit: 0 }).eq("id", t.id); onUpdate(); }} className="rounded bg-yellow-500/10 px-2 py-1 text-[10px] font-semibold text-yellow-400 transition hover:bg-yellow-500/20">Force Close</button>}
                  {t.status === "closed" && <button onClick={async () => { if (confirm("Delete this trade?")) { await supabase.from("trades").delete().eq("id", t.id); onUpdate(); } }} className="rounded bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400">Delete</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-sm text-white/30">No trades found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === TRANSACTIONS TAB ===
function TransactionsTab({
  transactions,
  traders,
  canApprove,
  onUpdate,
}: {
  transactions: Transaction[];
  traders: Trader[];
  canApprove: boolean;
  onUpdate: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const traderName = (id: string) => traders.find((t) => t.id === id)?.name ?? "Unknown";
  const filtered = transactions.filter((t) => filter === "all" || t.type === filter);
  const totalIn = transactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions.filter((t) => t.type === "withdrawal" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-white/40">{transactions.length} total · Net flow: ${(totalIn - totalOut).toFixed(2)}</p>
        </div>
        <div className="flex gap-1.5">
          {["all", "deposit", "withdrawal", "adjustment"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="text-xs text-white/40">Total Deposits</div>
          <div className="mt-1 text-xl font-bold text-green-400 tabular-nums">${totalIn.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="text-xs text-white/40">Total Withdrawals</div>
          <div className="mt-1 text-xl font-bold text-red-400 tabular-nums">${totalOut.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="text-xs text-white/40">Net Flow</div>
          <div className="mt-1 text-xl font-bold text-blue-400 tabular-nums">${(totalIn - totalOut).toFixed(2)}</div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131622]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
              <th className="px-4 py-3 text-left font-medium">Trader</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{traderName(tx.trader_id)}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${tx.type === "deposit" ? "bg-green-500/10 text-green-400" : tx.type === "withdrawal" ? "bg-red-500/10 text-red-400" : tx.type === "adjustment" ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-400"}`}>{tx.type}</span></td>
                <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">{tx.type === "withdrawal" ? "-" : "+"}${Number(tx.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tx.status === "completed" ? "bg-green-500/10 text-green-400" : tx.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>{tx.status}</span></td>
                <td className="px-4 py-3 text-xs text-white/50">{tx.description || "—"}</td>
                <td className="px-4 py-3 text-xs text-white/50">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  {canApprove && tx.status === "pending" && (
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={async () => { await supabase.from("transactions").update({ status: "completed" }).eq("id", tx.id); onUpdate(); }} className="rounded bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-400 hover:bg-green-500/20">Approve</button>
                      <button onClick={async () => { await supabase.from("transactions").update({ status: "rejected" }).eq("id", tx.id); onUpdate(); }} className="rounded bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/20">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-sm text-white/30">No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === REPORTS TAB ===
function ReportsTab({ traders, trades, transactions }: { traders: Trader[]; trades: Trade[]; transactions: Transaction[] }) {
  const totalBalance = traders.reduce((s, t) => s + Number(t.balance), 0);
  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalProfit = closedTrades.reduce((s, t) => s + Number(t.profit), 0);
  const winners = closedTrades.filter((t) => Number(t.profit) > 0).length;
  const losers = closedTrades.filter((t) => Number(t.profit) < 0).length;
  const winRate = closedTrades.length > 0 ? (winners / closedTrades.length) * 100 : 0;
  const totalDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);

  // Trader performance
  const traderStats: Record<string, { name: string; trades: number; profit: number; volume: number }> = {};
  trades.forEach((t) => {
    const trader = traders.find((tr) => tr.id === t.trader_id);
    if (!trader) return;
    if (!traderStats[t.trader_id]) traderStats[t.trader_id] = { name: trader.name || trader.email, trades: 0, profit: 0, volume: 0 };
    traderStats[t.trader_id].trades++;
    traderStats[t.trader_id].profit += Number(t.profit);
    traderStats[t.trader_id].volume += Number(t.volume);
  });
  const topTraders = Object.entries(traderStats).sort((a, b) => b[1].profit - a[1].profit).slice(0, 10);

  const exportCSV = () => {
    const rows = [["Trader", "Email", "Account #", "Type", "Balance", "Leverage", "Status", "Total Trades", "Total P&L", "Total Volume"]];
    traders.forEach((t) => {
      const stats = traderStats[t.id];
      rows.push([t.name, t.email, t.account_number, t.account_type, t.balance.toString(), t.leverage.toString(), t.is_active ? "Active" : "Disabled", stats?.trades?.toString() ?? "0", stats?.profit?.toFixed(2) ?? "0", stats?.volume?.toFixed(2) ?? "0"]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `brokerz-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-white/40">Comprehensive trading platform analytics</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-300">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ReportCard icon={Users} label="Total Traders" value={traders.length.toString()} subtext={`${traders.filter((t) => t.is_active).length} active`} />
        <ReportCard icon={DollarSign} label="AUM" value={`$${totalBalance.toFixed(2)}`} subtext="Assets under management" />
        <ReportCard icon={Activity} label="Total Trades" value={trades.length.toString()} subtext={`${closedTrades.length} closed`} />
        <ReportCard icon={TrendingUp} label="Win Rate" value={`${winRate.toFixed(1)}%`} subtext={`${winners}W / ${losers}L`} />
      </div>

      {/* Financial Overview */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#131622] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Financial Overview</h3>
          <div className="space-y-3">
            <SummaryRow label="Total Deposits" value={`$${totalDeposits.toFixed(2)}`} color="green" />
            <SummaryRow label="Total Withdrawals" value={`$${totalWithdrawals.toFixed(2)}`} color="red" />
            <SummaryRow label="Net Deposit Flow" value={`$${(totalDeposits - totalWithdrawals).toFixed(2)}`} color="blue" />
            <SummaryRow label="Total Realized P&L" value={`${totalProfit >= 0 ? "+" : ""}$${totalProfit.toFixed(2)}`} color={totalProfit >= 0 ? "green" : "red"} />
            <SummaryRow label="Total Volume Traded" value={`${trades.reduce((s, t) => s + Number(t.volume), 0).toFixed(2)} lots`} color="orange" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#131622] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Trade Performance</h3>
          <div className="space-y-3">
            <SummaryRow label="Total Trades" value={trades.length.toString()} color="blue" />
            <SummaryRow label="Open Positions" value={trades.filter((t) => t.status === "open").length.toString()} color="orange" />
            <SummaryRow label="Winning Trades" value={winners.toString()} color="green" />
            <SummaryRow label="Losing Trades" value={losers.toString()} color="red" />
            <SummaryRow label="Win Rate" value={`${winRate.toFixed(1)}%`} color="blue" />
          </div>
        </div>
      </div>

      {/* Top Traders Table */}
      <div className="mt-6 rounded-xl border border-white/10 bg-[#131622] p-5">
        <h3 className="mb-4 text-sm font-semibold text-white/80">Top 10 Traders by P&L</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
                <th className="px-4 py-3 text-left font-medium">Rank</th>
                <th className="px-4 py-3 text-left font-medium">Trader</th>
                <th className="px-4 py-3 text-right font-medium">Trades</th>
                <th className="px-4 py-3 text-right font-medium">Volume</th>
                <th className="px-4 py-3 text-right font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {topTraders.length > 0 ? topTraders.map(([id, stats], i) => (
                <tr key={id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400" : i === 1 ? "bg-white/10 text-white/60" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/40"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{stats.name}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70">{stats.trades}</td>
                  <td className="px-4 py-3 text-right font-mono text-white/70">{stats.volume.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${stats.profit >= 0 ? "text-green-400" : "text-red-400"}`}>{stats.profit >= 0 ? "+" : ""}${stats.profit.toFixed(2)}</td>
                </tr>
              )) : <tr><td colSpan={5} className="py-8 text-center text-sm text-white/30">No trade data available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === SETTINGS TAB ===
function SettingsTab({ settings, onUpdate }: { settings: SiteSetting[]; onUpdate: () => void }) {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const getValue = (key: string) => editedValues[key] ?? settings.find((s) => s.key === key)?.value ?? "";
  const handleSave = async (key: string) => {
    setSaving(key);
    await supabase.from("site_settings").update({ value: editedValues[key], updated_at: new Date().toISOString() }).eq("key", key);
    setSaving(null);
    onUpdate();
  };
  const groups = {
    "Site Branding": ["site_name", "site_tagline", "support_email", "support_phone"],
    "Trading Parameters": ["leverage_max", "min_deposit", "default_balance", "default_leverage", "default_account_type", "trading_enabled", "maintenance_mode"],
    "Spreads": ["spread_eurusd", "spread_xauusd", "spread_btcusd"],
    "Risk Management": ["max_volume", "min_volume", "margin_call_level", "stop_out_level"],
    "Commissions": ["commission_raw", "commission_tvraw", "execution_speed"],
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="mt-1 text-sm text-white/40">Control every aspect of the trading platform from here.</p>
      </div>
      <div className="space-y-6">
        {Object.entries(groups).map(([group, keys]) => (
          <div key={group} className="rounded-xl border border-white/10 bg-[#131622] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white/80">{group}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map((key) => {
                const setting = settings.find((s) => s.key === key);
                if (!setting) return null;
                const isBoolean = setting.value === "true" || setting.value === "false";
                return (
                  <div key={key} className="rounded-lg bg-white/5 p-3">
                    <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-white/40">{key.replace(/_/g, " ")}</label>
                    {isBoolean ? (
                      <select value={getValue(key)} onChange={(e) => setEditedValues((p) => ({ ...p, [key]: e.target.value }))} onBlur={() => handleSave(key)} className="w-full rounded bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400">
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : (
                      <input type="text" value={getValue(key)} onChange={(e) => setEditedValues((p) => ({ ...p, [key]: e.target.value }))} className="w-full rounded bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400" />
                    )}
                    {setting.description && <p className="mt-1 text-[10px] text-white/30">{setting.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === MODALS ===
function EditTraderModal({ trader, onClose, onUpdate }: { trader: Trader; onClose: () => void; onUpdate: () => void }) {
  const [form, setForm] = useState({ name: trader.name, email: trader.email, account_number: trader.account_number, account_type: trader.account_type, balance: trader.balance.toString(), leverage: trader.leverage.toString() });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await supabase.from("traders").update({ name: form.name, email: form.email, account_number: form.account_number, account_type: form.account_type, balance: Number(form.balance), leverage: Number(form.leverage), is_demo: false, updated_at: new Date().toISOString() }).eq("id", trader.id);
    setSaving(false); onUpdate(); onClose();
  };
  return (
    <Modal title="Edit Trader" onClose={onClose}>
      <div className="space-y-3">
        <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <FormField label="Account Number" value={form.account_number} onChange={(v) => setForm({ ...form, account_number: v })} />
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Account Type</label>
          <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400">
            <option value="classic">Classic</option><option value="raw">RAW</option><option value="tvraw">TradingView RAW</option>
          </select>
        </div>
        <FormField label="Balance ($)" value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} type="number" />
        <FormField label="Leverage" value={form.leverage} onChange={(v) => setForm({ ...form, leverage: v })} type="number" />
        <button onClick={handleSave} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-white transition hover:bg-yellow-300 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

function AdjustBalanceModal({ trader, onClose, onUpdate }: { trader: Trader; onClose: () => void; onUpdate: () => void }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal" | "adjustment">("deposit");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    const amt = Number(amount);
    if (isNaN(amt) || amt === 0) return;
    setSaving(true);
    const newBalance = type === "withdrawal" ? Number(trader.balance) - amt : Number(trader.balance) + amt;
    await supabase.from("traders").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", trader.id);
    await supabase.from("transactions").insert({ trader_id: trader.id, type, amount: amt, status: "completed", description: description || `Admin ${type} of $${amt.toFixed(2)}` });
    setSaving(false); onUpdate(); onClose();
  };
  return (
    <Modal title={`Adjust Balance — ${trader.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-lg bg-white/5 p-3 text-center"><div className="text-xs text-white/40">Current Balance</div><div className="text-2xl font-bold tabular-nums">${Number(trader.balance).toFixed(2)}</div></div>
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Action</label>
          <div className="grid grid-cols-3 gap-2">
            {(["deposit", "withdrawal", "adjustment"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`rounded-lg py-2 text-xs font-medium capitalize transition ${type === t ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{t}</button>
            ))}
          </div>
        </div>
        <FormField label="Amount ($)" value={amount} onChange={setAmount} type="number" />
        <FormField label="Description (optional)" value={description} onChange={setDescription} />
        <button onClick={handleSave} disabled={saving || !amount} className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-white transition hover:bg-yellow-300 disabled:opacity-50">
          <DollarSign className="h-4 w-4" /> {saving ? "Processing..." : "Apply"}
        </button>
      </div>
    </Modal>
  );
}

function NewTraderModal({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", account_type: "raw", balance: "10000", leverage: "500" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const handleSave = async () => {
    setSaving(true); setError("");
    const accountNumber = "500" + Math.floor(1000000 + Math.random() * 9000000).toString();
    const { error: err } = await supabase.from("traders").insert({
      name: form.name,
      email: form.email,
      account_number: accountNumber,
      account_type: form.account_type,
      balance: Number(form.balance),
      leverage: Number(form.leverage),
      is_demo: false,
      assigned_to: null,
      department: "sales",
      lead_id: null,
      team_id: null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); onUpdate(); onClose();
  };
  return (
    <Modal title="Add New Trader" onClose={onClose}>
      <div className="space-y-3">
        {error && <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"><AlertCircle className="h-4 w-4" /> {error}</div>}
        <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Account Type</label>
          <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })} className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400">
            <option value="classic">Classic</option><option value="raw">RAW</option><option value="tvraw">TradingView RAW</option>
          </select>
        </div>
        <FormField label="Initial Balance ($)" value={form.balance} onChange={(v) => setForm({ ...form, balance: v })} type="number" />
        <FormField label="Leverage" value={form.leverage} onChange={(v) => setForm({ ...form, leverage: v })} type="number" />
        <button onClick={handleSave} disabled={saving || !form.email} className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-white transition hover:bg-yellow-300 disabled:opacity-50">
          <Plus className="h-4 w-4" /> {saving ? "Creating..." : "Create Trader"}
        </button>
      </div>
    </Modal>
  );
}

// === SHARED UI ===
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#131622] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/50">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-yellow-400" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; subtext: string; color: "blue" | "green" | "red" | "orange"; trend?: "up" | "down" | "flat" }) {
  const colors = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20",
    green: "from-green-500/10 to-green-500/5 text-green-400 border-green-500/20",
    red: "from-red-500/10 to-red-500/5 text-red-400 border-red-500/20",
    orange: "from-orange-500/10 to-orange-500/5 text-orange-400 border-orange-500/20",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-b p-5 ${colors[color]}`}>
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-6 w-6" />
        {trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-400" />}
        {trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-400" />}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/40">{label}</div>
      <div className="text-[10px] text-white/30">{subtext}</div>
    </div>
  );
}

function ReportCard({ icon: Icon, label, value, subtext }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#131622] p-5">
      <Icon className="mb-3 h-6 w-6 text-yellow-400" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/40">{label}</div>
      <div className="text-[10px] text-white/30">{subtext}</div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color: "green" | "red" | "blue" | "orange" }) {
  const colors = { green: "text-green-400", red: "text-red-400", blue: "text-blue-400", orange: "text-orange-400" };
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className={`font-mono font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}
