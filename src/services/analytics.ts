import type { AdminAnalyticsDTO } from "@/types";

function parseBrowser(deviceName: string): string {
  const part = deviceName.split(" on ")[0]?.trim();
  return part || "Unknown";
}

function parseOs(deviceName: string): string {
  const part = deviceName.split(" on ")[1]?.trim();
  return part || "Unknown";
}

export async function getAdminAnalytics(db: D1Database): Promise<AdminAnalyticsDTO> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const today = dayStart.getTime();

  const [devices, activeGeo, durationRow, activeCount] = await Promise.all([
    db
      .prepare(
        `SELECT device_name, COUNT(*) AS count
         FROM sessions
         WHERE revoked_at IS NULL AND expires_at > ?
         GROUP BY device_name
         ORDER BY count DESC
         LIMIT 12`,
      )
      .bind(Date.now())
      .all<{ device_name: string; count: number }>(),
    db
      .prepare(
        `SELECT
           ROUND(last_lat, 1) AS lat,
           ROUND(last_lng, 1) AS lng,
           COUNT(*) AS count
         FROM location_sessions
         WHERE status = 'active' AND last_lat IS NOT NULL AND last_lng IS NOT NULL
         GROUP BY ROUND(last_lat, 1), ROUND(last_lng, 1)
         ORDER BY count DESC
         LIMIT 8`,
      )
      .all<{ lat: number; lng: number; count: number }>(),
    db
      .prepare(
        `SELECT AVG(ended_at - started_at) AS avg_ms
         FROM location_sessions
         WHERE ended_at IS NOT NULL AND started_at >= ?`,
      )
      .bind(today)
      .first<{ avg_ms: number | null }>(),
    db
      .prepare(`SELECT COUNT(*) AS n FROM location_sessions WHERE status = 'active'`)
      .first<{ n: number }>(),
  ]);

  const browserMap = new Map<string, number>();
  const osMap = new Map<string, number>();
  for (const row of devices.results) {
    const browser = parseBrowser(row.device_name);
    const os = parseOs(row.device_name);
    browserMap.set(browser, (browserMap.get(browser) ?? 0) + row.count);
    osMap.set(os, (osMap.get(os) ?? 0) + row.count);
  }

  const browserBreakdown = [...browserMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const deviceBreakdown = [...osMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const geoRegions = activeGeo.results.map((row) => ({
    label: `${row.lat.toFixed(1)}°, ${row.lng.toFixed(1)}°`,
    count: row.count,
    lat: row.lat,
    lng: row.lng,
  }));

  return {
    deviceBreakdown,
    browserBreakdown,
    geoRegions,
    avgSessionDurationMs: Math.round(durationRow?.avg_ms ?? 0),
    activeSessionCount: activeCount?.n ?? 0,
  };
}
