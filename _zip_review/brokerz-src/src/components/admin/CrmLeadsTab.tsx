import { useMemo, useState } from "react";
import { Plus, Search, UserPlus, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminUser, CrmLead, LeadStatus, Team, Trader } from "@/lib/types";
import { can, filterLeads } from "@/lib/crmRoles";

interface Props {
  department: "sales" | "retention";
  leads: CrmLead[];
  staff: AdminUser[];
  teams: Team[];
  traders: Trader[];
  user: AdminUser;
  onUpdate: () => void;
}

const SALES_STATUSES: LeadStatus[] = ["new", "contacted", "registered", "ftd", "inactive"];
const RET_STATUSES: LeadStatus[] = ["retention", "ftd", "inactive"];

export default function CrmLeadsTab({
  department,
  leads,
  staff,
  teams,
  traders,
  user,
  onUpdate,
}: Props) {
  const scoped = useMemo(
    () => filterLeads(leads, user).filter((l) => l.department === department),
    [leads, user, department],
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<CrmLead | null>(null);
  const [showNew, setShowNew] = useState(false);

  const statuses = department === "sales" ? SALES_STATUSES : RET_STATUSES;
  const canAssign = can(user, "assign_leads");
  const canFtd = can(user, "mark_ftd");

  const filtered = scoped.filter((l) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q);
    const matchS = statusFilter === "all" || l.status === statusFilter;
    return matchQ && matchS;
  });

  const staffName = (id: string | null) =>
    id ? staff.find((s) => s.id === id)?.name ?? "—" : "Unassigned";
  const teamName = (id: string | null) =>
    id ? teams.find((t) => t.id === id)?.name ?? "—" : "—";

  const pipeline = statuses.map((s) => ({
    status: s,
    count: scoped.filter((l) => l.status === s).length,
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {department === "sales" ? "Sales Pipeline" : "Retention Clients"}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {scoped.length} records in your scope · {department.toUpperCase()}
          </p>
        </div>
        {department === "sales" && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            <Plus className="h-4 w-4" /> New Lead
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {pipeline.map((p) => (
          <button
            key={p.status}
            type="button"
            onClick={() => setStatusFilter(statusFilter === p.status ? "all" : p.status)}
            className={`rounded-xl border p-4 text-left transition ${
              statusFilter === p.status
                ? "border-yellow-400/40 bg-yellow-500/10"
                : "border-white/10 bg-[#131622] hover:border-white/20"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              {p.status}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{p.count}</div>
          </button>
        ))}
      </div>

      <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5">
        <Search className="h-4 w-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131622]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
              <th className="px-4 py-3 text-left font-medium">Lead</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Assigned</th>
              <th className="px-4 py-3 text-left font-medium">Team</th>
              <th className="px-4 py-3 text-right font-medium">FTD</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-white/40">
                    {l.email} · {l.phone || "no phone"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-white/70">
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">{staffName(l.assigned_to)}</td>
                <td className="px-4 py-3 text-white/50">{teamName(l.team_id)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  ${Number(l.ftd_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setSelected(l)}
                    className="rounded bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold text-yellow-400 hover:bg-yellow-500/20"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-white/30">
                  No leads in this view
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <LeadDetailModal
          lead={selected}
          staff={staff}
          teams={teams}
          traders={traders}
          canAssign={canAssign}
          canFtd={canFtd}
          department={department}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            onUpdate();
            setSelected(null);
          }}
        />
      )}
      {showNew && (
        <NewLeadModal
          user={user}
          teams={teams}
          onClose={() => setShowNew(false)}
          onUpdate={() => {
            onUpdate();
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function LeadDetailModal({
  lead,
  staff,
  teams,
  traders,
  canAssign,
  canFtd,
  department,
  onClose,
  onUpdate,
}: {
  lead: CrmLead;
  staff: AdminUser[];
  teams: Team[];
  traders: Trader[];
  canAssign: boolean;
  canFtd: boolean;
  department: "sales" | "retention";
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [assigned, setAssigned] = useState(lead.assigned_to ?? "");
  const [teamId, setTeamId] = useState(lead.team_id ?? "");
  const [notes, setNotes] = useState(lead.notes);
  const [ftdAmount, setFtdAmount] = useState(String(lead.ftd_amount || ""));
  const [saving, setSaving] = useState(false);

  const agents = staff.filter(
    (s) =>
      s.is_active &&
      (department === "sales"
        ? String(s.role).includes("sales") || s.department === "sales"
        : String(s.role).includes("retention") || s.department === "retention"),
  );
  const deptTeams = teams.filter((t) => t.department === department);

  const save = async () => {
    setSaving(true);
    await supabase
      .from("crm_leads")
      .update({
        status,
        assigned_to: assigned || null,
        team_id: teamId || null,
        notes,
        ftd_amount: Number(ftdAmount) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);
    setSaving(false);
    onUpdate();
  };

  const markFtd = async () => {
    if (!canFtd) return;
    const amount = Number(ftdAmount) || 0;
    setSaving(true);
    await supabase
      .from("crm_leads")
      .update({
        status: "retention",
        department: "retention",
        ftd_amount: amount,
        notes: `${notes}\n[FTD] Moved to retention $${amount.toFixed(2)}`.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);
    if (lead.trader_id) {
      await supabase
        .from("traders")
        .update({
          department: "retention",
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.trader_id);
    }
    setSaving(false);
    onUpdate();
  };

  const linkTrader = async (traderId: string) => {
    setSaving(true);
    await supabase
      .from("crm_leads")
      .update({ trader_id: traderId || null, updated_at: new Date().toISOString() })
      .eq("id", lead.id);
    if (traderId) {
      await supabase
        .from("traders")
        .update({
          lead_id: lead.id,
          assigned_to: assigned || lead.assigned_to,
          team_id: teamId || lead.team_id,
          department: lead.department,
          updated_at: new Date().toISOString(),
        })
        .eq("id", traderId);
    }
    setSaving(false);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#131622] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-bold">{lead.name}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div className="text-xs text-white/40">
            {lead.email} · {lead.phone}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
            >
              {(department === "sales" ? SALES_STATUSES : RET_STATUSES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {canAssign && (
            <>
              <label className="block">
                <span className="mb-1 block text-xs text-white/50">Assign to</span>
                <select
                  value={assigned}
                  onChange={(e) => setAssigned(e.target.value)}
                  className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-white/50">Team</span>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="">No team</option>
                  {deptTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-white/50">FTD amount ($)</span>
            <input
              type="number"
              value={ftdAmount}
              onChange={(e) => setFtdAmount(e.target.value)}
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Linked trader</span>
            <select
              value={lead.trader_id ?? ""}
              onChange={(e) => linkTrader(e.target.value)}
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
            >
              <option value="">None</option>
              {traders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.account_number}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" /> Save
            </button>
            {canFtd && department === "sales" && lead.status !== "retention" && (
              <button
                type="button"
                disabled={saving}
                onClick={markFtd}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 py-3 text-sm font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4" /> Mark FTD → Retention
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewLeadModal({
  user,
  teams,
  onClose,
  onUpdate,
}: {
  user: AdminUser;
  teams: Team[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and e-mail are required");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("crm_leads").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      status: "new",
      department: "sales",
      assigned_to: user.id,
      team_id: user.team_id,
      trader_id: null,
      ftd_amount: 0,
      notes,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#131622] shadow-2xl">
        <div className="border-b border-white/10 px-5 py-3 text-sm font-bold">New Sales Lead</div>
        <div className="space-y-3 p-5">
          {error && <div className="text-sm text-red-400">{error}</div>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <p className="text-[11px] text-white/35">
            Team: {teams.find((t) => t.id === user.team_id)?.name ?? "Your default team"}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
