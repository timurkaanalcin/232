import { CRM_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import type { AnalyticsBreakdownItem, CrmOverviewDTO, CrmStatus, RoleId } from "@/types";

function startOfToday(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function endOfToday(): number {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

async function firstNumber(db: D1Database, sql: string, ...binds: unknown[]): Promise<number> {
  const row = await db.prepare(sql).bind(...binds).first<{ value: number }>();
  return row?.value ?? 0;
}

function toStatusBreakdown(rows: { status: CrmStatus; count: number }[]): AnalyticsBreakdownItem[] {
  return rows.map((row) => ({
    label: CRM_STATUS_LABELS[row.status] ?? row.status,
    count: row.count,
  }));
}

function toRoleBreakdown(rows: { role: RoleId; count: number }[]): AnalyticsBreakdownItem[] {
  return rows.map((row) => ({
    label: ROLE_LABELS[row.role] ?? row.role,
    count: row.count,
  }));
}

export async function getCrmOverview(db: D1Database): Promise<CrmOverviewDTO> {
  const now = Date.now();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [
    totalClients,
    activeClients,
    newClientsToday,
    missingAdSource,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    saleStatusRows,
    retentionStatusRows,
    adSourceRows,
    teamRoleRows,
  ] = await Promise.all([
    firstNumber(db, `SELECT COUNT(*) AS value FROM users WHERE role_id = 'user'`),
    firstNumber(db, `SELECT COUNT(*) AS value FROM users WHERE role_id = 'user' AND status = 'active'`),
    firstNumber(db, `SELECT COUNT(*) AS value FROM users WHERE role_id = 'user' AND created_at >= ?`, todayStart),
    firstNumber(db, `SELECT COUNT(*) AS value FROM users WHERE role_id = 'user' AND TRIM(ad_source) = ''`),
    firstNumber(
      db,
      `SELECT COUNT(*) AS value
       FROM (
         SELECT id FROM users WHERE role_id = 'user' AND sale_status_scheduled_at IS NOT NULL AND sale_status_scheduled_at < ?
         UNION ALL
         SELECT id FROM users WHERE role_id = 'user' AND retention_status_scheduled_at IS NOT NULL AND retention_status_scheduled_at < ?
       )`,
      now,
      now,
    ),
    firstNumber(
      db,
      `SELECT COUNT(*) AS value
       FROM (
         SELECT id FROM users WHERE role_id = 'user' AND sale_status_scheduled_at BETWEEN ? AND ?
         UNION ALL
         SELECT id FROM users WHERE role_id = 'user' AND retention_status_scheduled_at BETWEEN ? AND ?
       )`,
      todayStart,
      todayEnd,
      todayStart,
      todayEnd,
    ),
    firstNumber(
      db,
      `SELECT COUNT(*) AS value
       FROM (
         SELECT id FROM users WHERE role_id = 'user' AND sale_status_scheduled_at > ?
         UNION ALL
         SELECT id FROM users WHERE role_id = 'user' AND retention_status_scheduled_at > ?
       )`,
      todayEnd,
      todayEnd,
    ),
    db
      .prepare(
        `SELECT sale_status AS status, COUNT(*) AS count
         FROM users
         WHERE role_id = 'user'
         GROUP BY sale_status
         ORDER BY count DESC, sale_status ASC`,
      )
      .all<{ status: CrmStatus; count: number }>(),
    db
      .prepare(
        `SELECT retention_status AS status, COUNT(*) AS count
         FROM users
         WHERE role_id = 'user'
         GROUP BY retention_status
         ORDER BY count DESC, retention_status ASC`,
      )
      .all<{ status: CrmStatus; count: number }>(),
    db
      .prepare(
        `SELECT COALESCE(NULLIF(TRIM(ad_source), ''), 'Kaynak Yok') AS label, COUNT(*) AS count
         FROM users
         WHERE role_id = 'user'
         GROUP BY COALESCE(NULLIF(TRIM(ad_source), ''), 'Kaynak Yok')
         ORDER BY count DESC, label ASC
         LIMIT 8`,
      )
      .all<AnalyticsBreakdownItem>(),
    db
      .prepare(
        `SELECT role_id AS role, COUNT(*) AS count
         FROM users
         WHERE role_id <> 'user'
         GROUP BY role_id
         ORDER BY count DESC, role_id ASC`,
      )
      .all<{ role: RoleId; count: number }>(),
  ]);

  return {
    totalClients,
    activeClients,
    newClientsToday,
    missingAdSource,
    followUps: {
      overdue: overdueFollowUps,
      today: todayFollowUps,
      upcoming: upcomingFollowUps,
    },
    saleStatusBreakdown: toStatusBreakdown(saleStatusRows.results),
    retentionStatusBreakdown: toStatusBreakdown(retentionStatusRows.results),
    adSourceBreakdown: adSourceRows.results,
    teamRoleBreakdown: toRoleBreakdown(teamRoleRows.results),
  };
}
