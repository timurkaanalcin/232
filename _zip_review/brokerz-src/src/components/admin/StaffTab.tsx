import { useMemo, useState } from "react";
import { Plus, Users, UserCog } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminRole, AdminUser, Department, Team } from "@/lib/types";
import {
  can,
  defaultDepartmentForRole,
  normalizeRole,
  roleLabel,
  staffAssignableRoles,
} from "@/lib/crmRoles";

interface Props {
  user: AdminUser;
  staff: AdminUser[];
  teams: Team[];
  onUpdate: () => void;
}

export default function StaffTab({ user, staff, teams, onUpdate }: Props) {
  const [showUser, setShowUser] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const visibleStaff = useMemo(() => {
    const role = normalizeRole(String(user.role));
    if (role === "super_admin") return staff;
    if (role === "head_sales") {
      return staff.filter(
        (s) => s.department === "sales" || String(s.role).includes("sales"),
      );
    }
    if (role === "head_retention") {
      return staff.filter(
        (s) => s.department === "retention" || String(s.role).includes("retention"),
      );
    }
    if (role === "team_leader_sales" || role === "team_leader_retention") {
      return staff.filter((s) => s.team_id === user.team_id || s.id === user.id);
    }
    return staff.filter((s) => s.id === user.id);
  }, [staff, user]);

  const visibleTeams = useMemo(() => {
    const role = normalizeRole(String(user.role));
    if (role === "super_admin") return teams;
    if (role === "head_sales") return teams.filter((t) => t.department === "sales");
    if (role === "head_retention") return teams.filter((t) => t.department === "retention");
    return teams.filter((t) => t.id === user.team_id);
  }, [teams, user]);

  const canManage = can(user, "staff");
  const assignable = staffAssignableRoles(user);

  const toggleActive = async (s: AdminUser) => {
    if (!canManage || s.id === user.id) return;
    await supabase.from("admin_users").update({ is_active: !s.is_active }).eq("id", s.id);
    onUpdate();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Teams & Staff</h1>
          <p className="mt-1 text-sm text-white/40">
            Manage CRM hierarchy · Head / Team Leader / Agents
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            {normalizeRole(String(user.role)) === "super_admin" ||
            normalizeRole(String(user.role)).startsWith("head_") ? (
              <button
                type="button"
                onClick={() => setShowTeam(true)}
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                <Users className="h-4 w-4" /> New Team
              </button>
            ) : null}
            {assignable.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUser(true)}
                className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
              >
                <Plus className="h-4 w-4" /> Add Staff
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTeams.map((t) => {
          const leader = staff.find((s) => s.id === t.leader_id);
          const members = staff.filter((s) => s.team_id === t.id);
          return (
            <div key={t.id} className="rounded-xl border border-white/10 bg-[#131622] p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-400" />
                <div className="font-semibold">{t.name}</div>
              </div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {t.department}
              </div>
              <div className="mt-3 text-sm text-white/60">
                Leader: {leader?.name ?? "Unassigned"}
              </div>
              <div className="mt-1 text-xs text-white/40">{members.length} members</div>
            </div>
          );
        })}
        {visibleTeams.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-white/30">
            No teams in your scope
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131622]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/30">
              <th className="px-4 py-3 text-left font-medium">Staff</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Department</th>
              <th className="px-4 py-3 text-left font-medium">Team</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleStaff.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-white/40">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/70">{roleLabel(String(s.role))}</td>
                <td className="px-4 py-3 uppercase text-white/50">{s.department}</td>
                <td className="px-4 py-3 text-white/50">
                  {teams.find((t) => t.id === s.team_id)?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {s.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {canManage && s.id !== user.id && (
                    <button
                      type="button"
                      onClick={() => toggleActive(s)}
                      className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/10"
                    >
                      <UserCog className="h-3 w-3" />
                      {s.is_active ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUser && (
        <NewStaffModal
          actor={user}
          teams={visibleTeams}
          assignable={assignable}
          onClose={() => setShowUser(false)}
          onUpdate={() => {
            onUpdate();
            setShowUser(false);
          }}
        />
      )}
      {showTeam && (
        <NewTeamModal
          actor={user}
          staff={staff}
          onClose={() => setShowTeam(false)}
          onUpdate={() => {
            onUpdate();
            setShowTeam(false);
          }}
        />
      )}
    </div>
  );
}

function NewStaffModal({
  actor,
  teams,
  assignable,
  onClose,
  onUpdate,
}: {
  actor: AdminUser;
  teams: Team[];
  assignable: AdminRole[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>(assignable[0] ?? "sales_agent");
  const [teamId, setTeamId] = useState(actor.team_id ?? teams[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, e-mail and password are required");
      return;
    }
    setSaving(true);
    setError("");
    const department: Department = defaultDepartmentForRole(role);
    const { error: err } = await supabase.from("admin_users").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: password,
      role,
      department,
      team_id: teamId || null,
      manager_id: actor.id,
      is_active: true,
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
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#131622] p-5 shadow-2xl">
        <h2 className="mb-4 text-sm font-bold">Add Staff Member</h2>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <div className="space-y-3">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          >
            {assignable.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="">No team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewTeamModal({
  actor,
  staff,
  onClose,
  onUpdate,
}: {
  actor: AdminUser;
  staff: AdminUser[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const role = normalizeRole(String(actor.role));
  const defaultDept =
    role === "head_retention" || role === "super_admin" ? "retention" : "sales";
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<"sales" | "retention">(
    role === "head_retention" ? "retention" : role === "head_sales" ? "sales" : defaultDept,
  );
  const [leaderId, setLeaderId] = useState("");
  const [saving, setSaving] = useState(false);

  const leaders = staff.filter((s) => {
    if (department === "sales") {
      return String(s.role) === "team_leader_sales" || String(s.role) === "head_sales";
    }
    return String(s.role) === "team_leader_retention" || String(s.role) === "head_retention";
  });

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("teams").insert({
      name: name.trim(),
      department,
      leader_id: leaderId || null,
    });
    setSaving(false);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#131622] p-5 shadow-2xl">
        <h2 className="mb-4 text-sm font-bold">New Team</h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
          {role === "super_admin" && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as "sales" | "retention")}
              className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
            >
              <option value="sales">Sales</option>
              <option value="retention">Retention</option>
            </select>
          )}
          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="w-full rounded-lg bg-black/30 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="">No leader yet</option>
            {leaders.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={submit}
            className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create team"}
          </button>
        </div>
      </div>
    </div>
  );
}
