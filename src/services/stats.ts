import type { AdminStatsDTO } from "@/types";

export async function getAdminStats(db: D1Database, realtimeConnections: number): Promise<AdminStatsDTO> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = dayStart.getTime();

  const [totalUsers, activeUsers, activeSessions, sessionsToday, pointsToday, loginsToday, newUsersToday] =
    await db.batch<{ n: number }>([
      db.prepare(`SELECT COUNT(*) AS n FROM users`),
      db.prepare(`SELECT COUNT(*) AS n FROM users WHERE status = 'active'`),
      db.prepare(`SELECT COUNT(*) AS n FROM location_sessions WHERE status = 'active'`),
      db.prepare(`SELECT COUNT(*) AS n FROM location_sessions WHERE started_at >= ?`).bind(today),
      db.prepare(`SELECT COUNT(*) AS n FROM locations WHERE created_at >= ?`).bind(today),
      db.prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'auth.login' AND created_at >= ?`).bind(today),
      db.prepare(`SELECT COUNT(*) AS n FROM users WHERE created_at >= ?`).bind(today),
    ]);

  const count = (result: D1Result<{ n: number }>) => result.results[0]?.n ?? 0;

  return {
    totalUsers: count(totalUsers!),
    activeUsers: count(activeUsers!),
    activeSessions: count(activeSessions!),
    sessionsToday: count(sessionsToday!),
    pointsToday: count(pointsToday!),
    loginsToday: count(loginsToday!),
    newUsersToday: count(newUsersToday!),
    realtimeConnections,
  };
}
